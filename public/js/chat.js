//Load all messages when page opens
window.onload = loadMessages;


//Send Message
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) return;

    const token = localStorage.getItem("token");

    axios.post("http://localhost:3000/chat/send",
        { message },
        {
            headers: {
                Authorization: token
            }
        }
    )
        .then(res => {
            const msg = res.data.data;

            // Show message instantly
            addMessage(
                msg.message,
                "sent",
                "You",
                msg.createdAt
            );

            input.value = "";

            // OPTIONAL: reload full chat
            loadMessages();
        })
        .catch(err => console.log(err));
}


//Load All Messages
async function loadMessages() {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:3000/chat/messages", {
            headers: {
                Authorization: token
            }
        });

        const messages = response.data;
        const currentUserId = getUserIdFromToken(token);

        const chatBox = document.getElementById("chatMessages");

        // Clear old messages
        chatBox.innerHTML = "";

        // Render all messages
        messages.forEach(msg => {
            const type = msg.userId === currentUserId ? "sent" : "received";

            addMessage(
                msg.message,
                type,
                msg.User.name,
                msg.createdAt
            );
        });

    } catch (err) {
        console.error("Error loading messages:", err);
    }
}


//Add Message to UI
function addMessage(text, type, username, time) {
    const chat = document.getElementById("chatMessages");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);

    const formattedTime = new Date(time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `
        <div>${username}</div>
        <div class="bubble">${text}</div>
        <div class="timestamp">${formattedTime}</div>
    `;

    chat.appendChild(messageDiv);

    // Auto scroll to bottom
    chat.scrollTop = chat.scrollHeight;
}


//Extract userId from JWT
function getUserIdFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}


// Auto refresh every 5 sec
setInterval(loadMessages, 5000);