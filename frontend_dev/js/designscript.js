document.addEventListener("DOMContentLoaded", function() {
  loadChatHistory();
});

async function sendMessage() {
  let inputField = document.getElementById("userInput");
  let userMessage = inputField.value.trim();
  let chatbox = document.getElementById("chatbox");

  if (!userMessage) return;

  // Display user message
  chatbox.innerHTML += `<div class="message user"><strong>You:</strong> ${userMessage}</div>`;
  inputField.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;

  // Show typing indicator
  let typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "bot");
  typingIndicator.innerHTML = "<strong>Bot:</strong> Typing...";
  chatbox.appendChild(typingIndicator);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
      const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      chatbox.removeChild(typingIndicator);
      
      chatbox.innerHTML += `<div class="message bot">
          <strong>Bot:</strong> ${formatMessage(data.reply)}
      </div>`;
      
      chatbox.scrollTop = chatbox.scrollHeight;
  } catch (error) {
      chatbox.removeChild(typingIndicator);
      chatbox.innerHTML += `<div class="message bot"><strong>Bot:</strong> Error: ${error.message}</div>`;
      console.error("Chatbot error:", error);
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") sendMessage();
}

async function loadChatHistory() {
  let chatbox = document.getElementById("chatbox");
  try {
      let response = await fetch("/chat_history");
      let history = await response.json();
      chatbox.innerHTML = "";
      history.forEach(msg => {
          let roleClass = msg.role === "user" ? "user" : "bot";
          chatbox.innerHTML += `<div class="message ${roleClass}">
              <strong>${msg.role}:</strong> ${msg.content}
          </div>`;
      });
      chatbox.scrollTop = chatbox.scrollHeight;
  } catch (error) {
      console.error("Failed to load chat history:", error);
  }
}

async function clearChat() {
  document.getElementById("chatbox").innerHTML = "";
  await fetch("/clear_chat", { method: "POST" });
  alert("Chat history cleared!");
}

function formatMessage(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\n/g, "<br>");
  if (text.includes("- ")) {
      let items = text.split("- ").filter(item => item.trim() !== "");
      text = "<ul><li>" + items.join("</li><li>") + "</li></ul>";
  }
  return text;
}