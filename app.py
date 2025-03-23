from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import csv
import os
from apikey import api_data  # Ensure you have your API key

app = Flask(__name__)

# Configure Google Gemini API
GENAI_API_KEY = api_data
genai.configure(api_key=GENAI_API_KEY)

# CSV file to store chat history
CHAT_HISTORY_FILE = "chat_history.csv"

# Initialize conversation history (system message + last 10 messages)
messages = [{"role": "system", "content": "You are a helpful AI assistant."}]

# Function to load chat history from CSV
def load_chat_history():
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r", newline="", encoding="utf-8") as file:
            reader = csv.reader(file)
            for row in reader:
                if len(row) == 2:
                    messages.append({"role": row[0], "content": row[1]})

# Function to save a message to the CSV file
def save_message(role, content):
    with open(CHAT_HISTORY_FILE, "a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([role, content])

# Load chat history when the server starts
load_chat_history()

def generate_response():
    """Generate a response using Gemini AI with the correct format"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Remove system role (Gemini does not support it)
        formatted_messages = [
            {"role": msg["role"], "parts": [{"text": msg["content"]}]} 
            for msg in messages if msg["role"] in ["user", "assistant"]  # Exclude "system"
        ]

        response = model.generate_content(formatted_messages, generation_config=genai.GenerationConfig(
            max_output_tokens=100,
            temperature=0.1,
        ))

        return response.text  # Return the bot's response
    except Exception as e:
        return f"Error: {e}"


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get("message", "").strip()

    if not user_query:
        return jsonify({"reply": "Please enter a message."})

    # Add user message to conversation history
    messages.append({"role": "user", "content": user_query})
    save_message("user", user_query)

    # Generate bot response
    bot_response = generate_response()

    # Add bot response to conversation history
    messages.append({"role": "assistant", "content": bot_response})
    save_message("assistant", bot_response)

    # Keep only the last 10 messages in memory (for performance)
    if len(messages) > 20:
        messages.pop(1)  # Remove oldest message except system prompt

    return jsonify({"reply": bot_response})

# ✅ New Route: Fetch Chat History for the Frontend
@app.route('/chat_history', methods=['GET'])
def get_chat_history():
    """Returns chat history as JSON for the frontend"""
    chat_history = []
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r", newline="", encoding="utf-8") as file:
            reader = csv.reader(file)
            for row in reader:
                if len(row) == 2:
                    chat_history.append({"role": row[0], "content": row[1]})

    return jsonify(chat_history)

# Start Flask server
if __name__ == '__main__':
    app.run(debug=True)
