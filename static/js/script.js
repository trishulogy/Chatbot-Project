document.addEventListener("DOMContentLoaded", function () {
  loadChatHistory();
});

// Function to send a message
async function sendMessage() {
  let inputField = document.getElementById("userInput");
  let userMessage = inputField.value.trim();
  let chatbox = document.getElementById("chatbox");

  if (userMessage === "") return;

  // Display user message
  chatbox.innerHTML += `<div class="message user"><strong>You:</strong> ${userMessage}</div>`;
  inputField.value = "";
  chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll down

  // Send message to backend
  let response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
  });

  let data = await response.json();

  // Display bot response
  chatbox.innerHTML += `<div class="message bot"><strong>Bot:</strong> ${data.reply}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll down
}

// Function to handle "Enter" key press
function handleKeyPress(event) {
  if (event.key === "Enter") {
      sendMessage();
  }
}

// Function to load chat history
async function loadChatHistory() {
  let chatbox = document.getElementById("chatbox");

  let response = await fetch("/chat_history");
  let history = await response.json();

  history.forEach(msg => {
      let roleClass = msg.role === "user" ? "user" : "bot";
      chatbox.innerHTML += `<div class="message ${roleClass}"><strong>${msg.role}:</strong> ${msg.content}</div>`;
  });

  chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to clear chat
async function clearChat() {
  document.getElementById("chatbox").innerHTML = "";

  await fetch("/clear_chat", { method: "POST" });
  alert("Chat history cleared!");
}
