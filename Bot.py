import google.generativeai as genai  # pip install google-generativeai
import tkinter as tk  # pip install tk
from tkinter import scrolledtext
from apikey import api_data

# Configure Google Gemini API
GENAI_API_KEY = api_data
genai.configure(api_key=GENAI_API_KEY)

def generate_response(query):
    """Generate a response for the given query using Gemini."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(query, generation_config=genai.GenerationConfig(
            max_output_tokens=75,
            temperature=0.1,
        ))
        return response.text
    except Exception as e:
        return f"Sorry, I encountered an error: {e}"

def send_message(event=None):
    """Handles user input and displays chatbot response."""
    query = user_input.get()
    if not query.strip():
        return
    
    conversation_area.insert(tk.END, f"You: {query}\n", "user")
    user_input.delete(0, tk.END)
    
    response = generate_response(query)
    conversation_area.insert(tk.END, f"Noa: {response}\n", "bot")
    conversation_area.see(tk.END)

def end_chat():
    """Ends the chat application."""
    root.quit()

# Set up GUI
root = tk.Tk()
root.title("Noa Chatbot")
root.configure(bg="black")

conversation_area = scrolledtext.ScrolledText(root, wrap=tk.WORD, width=50, height=20, font=("Arial", 12), bg="black", fg="white")
conversation_area.tag_config("user", foreground="yellow")
conversation_area.tag_config("bot", foreground="lightgreen")
conversation_area.pack(padx=10, pady=10)

user_input = tk.Entry(root, font=("Arial", 12), width=40, bg="grey", fg="white")
user_input.pack(pady=5)
user_input.bind("<Return>", send_message)  # Bind Enter key to send message

send_button = tk.Button(root, text="Send", font=("Arial", 12), command=send_message, bg="grey", fg="white")
send_button.pack(pady=5)

end_button = tk.Button(root, text="End Chat", font=("Arial", 12), command=end_chat, bg="red", fg="white")
end_button.pack(pady=5)

root.mainloop()
