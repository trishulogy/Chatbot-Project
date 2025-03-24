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

  // Show "Typing..." message while waiting
  let typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "bot");
  typingIndicator.innerHTML = "<strong>Bot:</strong> Typing...";
  chatbox.appendChild(typingIndicator);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
      // Send message to backend
      let response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
      });

      let data = await response.json();

      // Remove "Typing..." message
      chatbox.removeChild(typingIndicator);

      // Display bot response
      chatbox.innerHTML += `<div class="message bot">
        <strong>Bot:</strong> ${formatMessage(data.reply)}
      </div>`;


      chatbox.scrollTop = chatbox.scrollHeight; // Auto-scroll down
  } catch (error) {
      chatbox.removeChild(typingIndicator);
      chatbox.innerHTML += `<div class="message bot"><strong>Bot:</strong> Error: Failed to get a response.</div>`;
  }
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

// Function to format AI messages into structured HTML
function formatMessage(text) {
  // Convert new lines into <br> for better spacing
  text = text.replace(/\n/g, "<br>");

  // Convert **bold** text into <strong> tags
  text = text.replace(/\*{2}([\s\S]+?)\*{2}/g, "<strong>$1</strong>");

  // Convert lists (* item) into proper <ul><li> lists
  text = text.replace(/\* (.*?)\n/g, "<li>$1</li>");
  text = text.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

  return text;
}
