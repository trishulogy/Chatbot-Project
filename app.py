from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
from apikey import api_data  # Ensure you have your API key

app = Flask(__name__)

# Configure Google Gemini API
GENAI_API_KEY = api_data
genai.configure(api_key=GENAI_API_KEY)

def generate_response(query):
    """Generate a response using Gemini AI"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(query, generation_config=genai.GenerationConfig(
            max_output_tokens=75,
            temperature=0.1,
        ))
        return response.text
    except Exception as e:
        return f"Error: {e}"

# Serve the HTML page
@app.route('/')
def home():
    return render_template('index.html')

# Chatbot API endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_query = data.get("message", "")
    if not user_query:
        return jsonify({"response": "Please enter a message."})
    
    bot_response = generate_response(user_query)
    return jsonify({"reply": bot_response})

if __name__ == '__main__':
    app.run(debug=True)
