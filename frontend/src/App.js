import React, { useState, useEffect } from "react";
import "./App.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en-US");

  // Load preferences
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const savedLang = localStorage.getItem("language");
    if (savedMode === "true") setDarkMode(true);
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode ? "true" : "false");
      return newMode;
    });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  // Speak response
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const cleanedText = text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
        ""
      );
      const utterance = new SpeechSynthesisUtterance(cleanedText.trim());
      utterance.lang = language;

      const mouth = document.getElementById("mouth");
      let interval;

      utterance.onstart = () => {
        interval = setInterval(() => {
          if (mouth) {
            const rx = 10 + Math.random() * 15;
            const ry = 4 + Math.random() * 4;
            mouth.setAttribute("rx", rx);
            mouth.setAttribute("ry", ry);
          }
        }, 100);
      };

      utterance.onend = () => {
        clearInterval(interval);
        if (mouth) {
          mouth.setAttribute("rx", 20);
          mouth.setAttribute("ry", 5);
        }
      };

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  // API call
  const askAssistant = async (inputText = query) => {
    const res = await fetch("https://medsupport.onrender.com/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: inputText }),
    });

    const data = await res.json();
    setResponse(data.answer);
    speak(data.answer);
  };

  // Voice input
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      askAssistant(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <header className="header">
        <h1 className="title">🩺 MedSupport Assistant</h1>

        <div className="controls">
          <select
            className="dropdown"
            value={language}
            onChange={handleLanguageChange}
            title="Select Language"
          >
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="de-DE">German</option>
            <option value="bn-IN">Bengali (Assamese alt)</option>
          </select>

          <button className="toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      {/* Avatar */}
      <div className="avatar">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="60" fill="#fce4b2" stroke="#333" strokeWidth="2" />
          <ellipse className="eye" cx="50" cy="60" rx="8" ry="8" fill="black" />
          <ellipse className="eye" cx="100" cy="60" rx="8" ry="8" fill="black" />
          <ellipse className="eyelid" cx="50" cy="60" rx="8" ry="8" fill="#fce4b2" />
          <ellipse className="eyelid" cx="100" cy="60" rx="8" ry="8" fill="#fce4b2" />
          <ellipse id="mouth" cx="75" cy="100" rx="20" ry="5" fill="black" />
          <polygon points="72,75 75,85 78,75" fill="#d8a97d" />
          <circle cx="15" cy="75" r="10" fill="#fce4b2" />
          <circle cx="135" cy="75" r="10" fill="#fce4b2" />
        </svg>
      </div>

      {/* Input area */}
      <div className="card">
        <textarea
          className="input-area"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your medical question..."
          rows={4}
        />

        <div className="button-group">
          <button className="btn" onClick={() => askAssistant()}>
            🧠 Ask
          </button>
          <button
            className="btn secondary"
            onClick={startListening}
            disabled={listening}
          >
            {listening ? "🎙️ Listening..." : "🎤 Speak"}
          </button>
        </div>

        {response && (
          <div className="response-box">
            <strong>Response:</strong>
            <p>{response}</p>
          </div>
        )}
      </div>

      <footer className="signature">Created by Amlan</footer>
    </div>
  );
}

export default App;
