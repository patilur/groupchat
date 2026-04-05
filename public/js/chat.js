// ================= INIT =================
const token = localStorage.getItem("token");

const socket = io("http://localhost:3000", {
    auth: { token }
});

let currentRoom = null;

// ================= HELPERS =================
function getUserIdFromToken(token) {
    return JSON.parse(atob(token.split('.')[1])).userId;
}

function getEmailFromToken(token) {
    return JSON.parse(atob(token.split('.')[1])).email;
}
socket.on("user_connected", (data) => {
    alert(data.message);
});
// ================= SOCKET =================
socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.on("receive_message", (msg) => {
    const myId = getUserIdFromToken(token);

    const type = msg.user.id === myId ? "sent" : "received";

    addMessage(msg.message, msg.user.name, type);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

// ================= START CHAT =================
async function startChat() {
    const searchedEmail = document.getElementById("searchEmail").value.trim();
    const myEmail = localStorage.getItem("email");

    if (!searchedEmail) return alert("Enter email");

    if (searchedEmail === myEmail) {
        return alert("You cannot chat with yourself");
    }

    //CREATE SAME ROOM FOR BOTH USERS
    const roomId = [myEmail, searchedEmail].sort().join("_");

    currentRoom = roomId;

    //PASS OTHER USER EMAIL
    socket.emit("join_room", roomId, searchedEmail);

    loadMessages(roomId);
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const msg = document.getElementById("messageInput").value;

    if (!msg || !currentRoom) return;

    const token = localStorage.getItem("token");

    //Save to DB via API
    await axios.post("http://localhost:3000/chat/send", {
        message: msg,
        roomId: currentRoom
    }, {
        headers: { Authorization: token }
    });

    document.getElementById("messageInput").value = "";
}

// ================= LOAD MESSAGES =================
async function loadMessages(roomId) {
    try {
        const res = await axios.get(
            `http://localhost:3000/chat/${roomId}`,
            { headers: { Authorization: token } }
        );

        const chatBox = document.getElementById("chatMessages");
        chatBox.innerHTML = "";

        const myId = getUserIdFromToken(token);

        res.data.forEach(msg => {
            const type = msg.userId === myId ? "sent" : "received";

           addMessage(msg.message, msg.User?.name || msg.user?.name, type);
        });

    } catch (err) {
        console.log("Error loading messages:", err);
    }
}

// ================= ADD MESSAGE TO UI =================
function addMessage(message, username, type = "received") {
    const chatBox = document.getElementById("chatMessages");

    const div = document.createElement("div");
    div.classList.add("message");

    // Align message
    div.style.textAlign = type === "sent" ? "right" : "left";

    // Format time
    const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div><strong>${username}</strong></div>
        <div>${message}</div>
        <div style="font-size:10px;color:gray;">${time}</div>
    `;

    chatBox.appendChild(div);

    // Auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ================= SEARCH USERS =================
async function searchUsers() {
    const query = document.getElementById("searchEmail").value.trim();

    if (!query) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }

    try {
        const res = await axios.get(
            `http://localhost:3000/user/search?email=${query}`,
            { headers: { Authorization: token } }
        );

        const box = document.getElementById("suggestions");
        box.innerHTML = "";

        res.data.forEach(user => {
            const div = document.createElement("div");
            div.innerText = `${user.name} (${user.email})`;
            div.style.cursor = "pointer";
            div.style.padding = "5px";

            div.onclick = () => {
                document.getElementById("searchEmail").value = user.email;
                box.innerHTML = "";
            };

            box.appendChild(div);
        });

    } catch (err) {
        console.log("Search error:", err);
    }
}