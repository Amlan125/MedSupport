# 🩺 MedSupport – AI-powered Medical Assistant

MedSupport is a full-stack AI medical assistant web app built with **Flask**, **React**, and **LangChain**.  
It lets users ask medical questions via text or voice, and get real-time answers powered by advanced language models and embeddings.  
Features voice input, speech synthesis, multilingual support, and persistent chat history.

![MedSupport Screenshot](https://your-screenshot-url.com) <!-- optional: add screenshot -->

---

## ✨ **Features**
- 🧠 **AI Q&A:** Uses LangChain + OpenAI / HuggingFace embeddings to answer user questions.
- 🎙️ **Voice input & output:** Users can speak their questions, and the assistant replies out loud.
- 🌗 **Dark / Light mode** toggle.
- 🌐 **Multilingual support:** Switch between English, Hindi, German, and Bengali.
- 🔄 **Persistent chat history:** Stored in Redis so conversations are remembered across sessions.
- 🧩 **Clean responsive frontend:** Built with React and animated SVG avatar.

---

## 📦 **Project structure**

MedSupport/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env
├── frontend/
│   ├── public/
│   ├── package.json
│   └── src/
│       ├── App.js
│       └── App.css
└── README.md


---

## 🚀 **Getting started**

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourusername/MedSupport.git
cd MedSupport
```

2️⃣ Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file:
```
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
REDIS_URL=redis://localhost:6379
```

Run backend:
```
python app.py
```

3️⃣ Frontend setup
```
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000
Backend runs on: http://127.0.0.1:5000

🐳 Optional: Docker deployment
Build and run backend:
```
cd backend
docker build -t medsupport-backend .
docker run -p 5000:5000 medsupport-backend
```
Frontend can also be containerized similarly.

⚙️ Tech stack
Backend: Flask, LangChain, OpenAI, HuggingFace, ChromaDB, Redis

Frontend: React, SpeechRecognition API, SpeechSynthesis API

Others: Docker, dotenv

🎨 Screenshots & Demo
(Add screenshots or a short demo video here to show features visually)

📄 License
This project is licensed under the MIT License.

✍️ Author
👤 Amlan

🌱 Built as a side project to explore AI & voice UI.

⭐ Contributing
Contributions, issues and feature requests are welcome!
Feel free to open an issue or submit a PR.

❤️ Acknowledgements
OpenAI

LangChain

HuggingFace

React community

