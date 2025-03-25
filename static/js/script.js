document.addEventListener("DOMContentLoaded", function () {
  loadChatHistory();
});

// Function to send a message
async function sendMessage() {
  let inputField = document.getElementById("userInput");
  let userMessage = inputField.value.trim();
  let chatbox = document.getElementById("chatbox");

  if (userMessage === "") return; // ✅ Prevent empty messages

  // ✅ Display user message
  chatbox.innerHTML += `<div class="message user"><strong>You:</strong> ${userMessage}</div>`;
  inputField.value = "";
  chatbox.scrollTop = chatbox.scrollHeight;

  // ✅ Show "Typing..." while waiting for response
  let typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "bot");
  typingIndicator.innerHTML = "<strong>Bot:</strong> Typing...";
  chatbox.appendChild(typingIndicator);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
      // ✅ Send message to Flask backend
      let response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
      }

      let data = await response.json();
      chatbox.removeChild(typingIndicator); // ✅ Remove "Typing..."

      // ✅ Display bot response
      chatbox.innerHTML += `<div class="message bot">
        <strong>Bot:</strong> ${formatMessage(data.reply)}
      </div>`;

      chatbox.scrollTop = chatbox.scrollHeight;

  } catch (error) {
      chatbox.removeChild(typingIndicator);
      chatbox.innerHTML += `<div class="message bot"><strong>Bot:</strong> Error: Failed to get a response.</div>`;
      console.error("Chatbot error:", error);
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

  try {
      let response = await fetch("/chat_history");  // ✅ Fetch chat history from Flask
      let history = await response.json();

      chatbox.innerHTML = "";  // ✅ Clear chatbox before loading history

      history.forEach(msg => {
          let roleClass = msg.role === "user" ? "user" : "bot";
          chatbox.innerHTML += `<div class="message ${roleClass}">
              <strong>${msg.role}:</strong> ${msg.content}
          </div>`;
      });

      chatbox.scrollTop = chatbox.scrollHeight;  // ✅ Auto-scroll to latest message
  } catch (error) {
      console.error("Failed to load chat history:", error);
  }
}


// Function to clear chat
async function clearChat() {
  document.getElementById("chatbox").innerHTML = "";

  await fetch("/clear_chat", { method: "POST" });
  alert("Chat history cleared!");
}

// Function to format AI messages into structured HTML
function formatMessage(text) {
  // Preserve emojis and informal punctuation
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(\w)'(\w)/g, "$1&rsquo;$2"); // Handle apostrophes
  text = text.replace(/\n/g, "<br>");
  return text;
}


// Load chat history when the page loads
document.addEventListener("DOMContentLoaded", function () {
  loadChatHistory();
});

async function loadChatHistory() {
  let chatbox = document.getElementById("chatbox");

  try {
      let response = await fetch("/chat_history");  // Fetch previous messages
      let history = await response.json();

      history.forEach(msg => {
          let roleClass = msg.role === "user" ? "user" : "bot";
          chatbox.innerHTML += `<div class="message ${roleClass}">
              <strong>${msg.role}:</strong> ${msg.content}
          </div>`;
      });

      chatbox.scrollTop = chatbox.scrollHeight;  // Auto-scroll to the latest message
  } catch (error) {
      console.error("Failed to load chat history:", error);
  }
}


function scrollToChat() {
  let chatSection = document.getElementById("chat-container");
  chatSection.scrollIntoView({ behavior: "smooth" });
}
