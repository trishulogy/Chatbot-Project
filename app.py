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

        # ✅ Convert messages into correct format (Remove 'system' role)
        formatted_messages = []
        for msg in messages:
            if msg["role"] in ["user", "assistant"]:  # Ignore 'system'
                formatted_messages.append({
                    "role": msg["role"],
                    "parts": [{"text": msg["content"]}]
                })

        response = model.generate_content(formatted_messages, generation_config=genai.GenerationConfig(
            max_output_tokens=500,  # Increased token limit to prevent cut-off responses
            temperature=0.1,
        ))

        return response.text  # ✅ Extract AI response properly
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
    print("AI Response:", bot_response)  # ✅ Debugging output

    # Add bot response to conversation history
    messages.append({"role": "assistant", "content": bot_response})
    save_message("assistant", bot_response)

    # ✅ Keep only the last 10 messages in memory (excluding system prompt)
    if len(messages) > 20:
        messages.pop(1)

    # ✅ Trim CSV file to keep only the last 10 conversations
    trim_csv_history()

    return jsonify({"reply": bot_response})

# ✅ Function to trim chat history in CSV file
def trim_csv_history():
    """Keeps only the last 10 messages in the CSV file"""
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r", newline="", encoding="utf-8") as file:
            lines = file.readlines()

        # Keep only the last 20 lines (10 user + 10 bot messages)
        with open(CHAT_HISTORY_FILE, "w", newline="", encoding="utf-8") as file:
            file.writelines(lines[-20:])

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

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    """Clears chat history from memory and CSV"""
    global messages
    messages = [{"role": "system", "content": "You are a helpful AI assistant."}]

    # Clear CSV file
    open(CHAT_HISTORY_FILE, "w").close()
    
    return jsonify({"status": "Chat history cleared!"})

# Start Flask server
if __name__ == '__main__':
    app.run(debug=True)
