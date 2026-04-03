//Load all messages when page opens
window.onload = loadMessages;

//const socket = new WebSocket("ws://localhost:3000");
const socket = io("http://localhost:3000");


socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.on("newMessage", (msg) => {
    const token = localStorage.getItem("token");
    const currentUserId = getUserIdFromToken(token);

    const type = msg.user.id === currentUserId ? "sent" : "received";

    addMessage(
        msg.message,
        type,
        msg.user.name,
        msg.createdAt
    );
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.log("Connection error:", err);
});
// socket.onmessage = (event) => {
//     const response = JSON.parse(event.data);

//     if (response.type === "NEW_MESSAGE") {
//         const msg = response.data;

//         addMessage(
//             msg.message,
//             "received",
//             msg.user.name,
//             msg.createdAt
//         );
//     }
// };
// socket.onclose = () => {
//     console.log("Disconnected from server");
// };

// socket.onerror = (error) => {
//     console.log("WebSocket error:", error);
// };
//Send Message
function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) return;

    const token = localStorage.getItem("token");

    //Clear input immediately (better UX)
    input.value = "";

    axios.post("http://localhost:3000/chat/send",
        { message },
        {
            headers: {
                Authorization: token
            }
        }
    )
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
