import React, { useState, useEffect } from "react";
import "./App.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode ? "true" : "false");
      return newMode;
    });
  };

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDarkMode(true);
  }, []);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const cleanedText = text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
        ""
      );
      const utterance = new SpeechSynthesisUtterance(cleanedText.trim());
      utterance.lang = "en-US";
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

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

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
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
      <header>
        <h1 className="title">🩺 MedSupport Assistant</h1>
        <button className="toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

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
    </div>
  );
}

export default App;
