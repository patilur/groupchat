
function sendMessage() {
    const input = document.getElementById("messageInput");
    const messageText = input.value.trim();

    if (!messageText) return;

    addMessage(messageText, "sent");

    input.value = "";
}

function addMessage(text, type) {
    const chat = document.getElementById("chatMessages");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
<div class="bubble">${text}</div>
<div class="timestamp">${time}</div>
`;

    chat.appendChild(messageDiv);

    // Auto scroll
    chat.scrollTop = chat.scrollHeight;
}
