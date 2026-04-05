//Load all messages when page opens
window.onload = loadMessages;

//Create Socket.IO connection=>Connects frontend → backend in real-time
//const socket = new WebSocket("ws://localhost:3000");
const token = localStorage.getItem("token");

console.log("Frontend token:", token); // DEBUG

const socket = io("http://localhost:3000", {
    auth: {
        token: token,
    }
});

//When connection is successful
socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.on("receive_message", (msg) => {
    const token = localStorage.getItem("token");
    const currentUserId = getUserIdFromToken(token);

    const type = msg.user.id === currentUserId ? "sent" : "received";

    addMessage(
        msg.message,
        type,
        msg.user.name + "(" + msg.user.email + ")",
        msg.createdAt
    );
});


socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.log("Connection error:", err);
});

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) return;

    socket.emit("send_message", {
        roomId: window.currentRoom, // null = global
        message: message
    });

    input.value = "";
}

function joinChat() {
    const email = document.getElementById("emailInput").value.trim();

    if (!email) {
        alert("No email → global chat mode");
        window.currentRoom = null;
        return;
    }



    socket.emit("join_room", email);


    window.currentRoom = roomId;
    //Show alert
    alert(`Joined room: ${roomId}`);
    console.log("Joined room:", roomId);
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message) return;
    console.log("Sending roomId:", window.currentRoom);
    socket.emit("send_message", {
        roomId: window.currentRoom, // null = global
        message: message
    });

    input.value = "";
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
