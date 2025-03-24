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
  chatbox.innerHTML += `<div class="message bot">
    <strong>Bot:</strong> ${formatMessage(data.response)}
</div>`;


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


document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
});

// List of available themes
const themes = ["dark-theme", "light-theme"];
let currentThemeIndex = 0;

// Function to toggle theme
function toggleTheme() {
  let body = document.body;

  // Remove the current theme
  body.classList.remove(...themes);

  // Select the next theme in the list
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  let newTheme = themes[currentThemeIndex];

  // Apply the new theme
  body.classList.add(newTheme);

  // Save the selected theme in localStorage
  localStorage.setItem("theme", newTheme);
}

// Function to load the saved theme on page load
function loadTheme() {
  let savedTheme = localStorage.getItem("theme");
  if (savedTheme && themes.includes(savedTheme)) {
      document.body.classList.add(savedTheme);
      currentThemeIndex = themes.indexOf(savedTheme);
  }
}

