# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import redis
import re

from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import RedisChatMessageHistory

load_dotenv()

app = Flask(__name__)
CORS(app)

# ENV variables
api_key = os.getenv("OPENAI_API_KEY")
api_base = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

# Initialize Redis client
redis_client = redis.Redis.from_url(redis_url)

# LLM setup
llm = ChatOpenAI(
    model="deepseek/deepseek-r1:free",
    openai_api_key=api_key,
    openai_api_base=api_base
)

embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
chroma_store = Chroma(persist_directory="chroma_db", embedding_function=embedding)
retriever = chroma_store.as_retriever()

# Chat prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful medical assistant."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# Chain + persistent Redis message history
chain = prompt | llm

chat_runnable = RunnableWithMessageHistory(
    chain,
    lambda session_id: RedisChatMessageHistory(
        session_id=session_id,
        url=redis_url
    ),
    input_messages_key="input",
    history_messages_key="history"
)

def strip_markdown(text):
    # Remove Markdown headers, symbols, and emojis for clean plain text
    text = re.sub(r"[#*_`>|~\-]", "", text)            # remove markdown special chars
    text = re.sub(r'[^\w\s,.?!]', '', text)            # remove emojis/non-word chars except punctuation
    text = re.sub(r'\n+', ' ', text)                    # collapse newlines to spaces
    text = re.sub(r'\s+', ' ', text)                    # collapse multiple spaces
    return text.strip()

@app.route("/api/ask", methods=["POST", "OPTIONS"])
def handle_ask():
    if request.method == "OPTIONS":
        return app.make_default_options_response()

    data = request.get_json()
    user_input = data.get("prompt", "")
    session_id = data.get("session_id", "user-123")

    response = chat_runnable.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}}
    )

    cleaned = strip_markdown(response.content)
    return jsonify({"answer": cleaned})

@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


if __name__ == "__main__":
    app.run(debug=True)
