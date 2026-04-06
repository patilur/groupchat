
// ================= INIT =================
const token = localStorage.getItem("token");

const socket = io("http://localhost:3000", {
    auth: { token }
});

let currentRoom = null;

// ================= SAFE TOKEN DECODE =================
function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return {};
    }
}

// ================= SOCKET =================
socket.on("connect", () => {
    console.log("Connected:", socket.id);
});

socket.on("receive_message", (msg) => {
    const myId = decodeToken(token).userId;

    const type = msg.user.id === myId ? "sent" : "received";

    addMessage(msg.message, msg.user.name, type);
});

//USER CONNECTED ALERT
socket.on("user_connected", (data) => {
    alert(data.message);
    addSystemMessage(data.message);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

// ================= START CHAT =================
// public/js/chat.js

async function startChat() {
    const searchedEmail = document.getElementById("searchEmail").value.trim();
    const myEmail = localStorage.getItem("email");

    if (!searchedEmail) return alert("Please enter an email");
    if (searchedEmail === myEmail) return alert("You cannot chat with yourself");

    try {
        // STEP 1: Prevent Dummy Emails - Validate user exists in DB
        const response = await axios.get(
            `http://localhost:3000/user/search?email=${searchedEmail}`,
            { headers: { Authorization: token } }
        );

        // Check if the exact user exists
        const userExists = response.data.find(u => u.email === searchedEmail);
        if (!userExists) {
            return alert("User not found in database. Please enter a valid registered email.");
        }

        // STEP 2: Generate Unique Room ID by sorting emails alphabetically
        const roomId = [myEmail, searchedEmail].sort().join("_");
        currentRoom = roomId;

        // Update UI
        document.querySelector(".chat-header h5").innerText = `Chat with ${searchedEmail}`;

        // STEP 3: Join the room via Socket.IO
        socket.emit("join_room", roomId, searchedEmail);

        // Load existing history for this specific room
        loadMessages(roomId);

    } catch (err) {
        console.error("Verification error:", err);
        alert("Could not verify user.");
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const msgInput = document.getElementById("messageInput");
    const msg = msgInput.value.trim();

    if (!msg || !currentRoom) return;



    try {
        await axios.post("http://localhost:3000/chat/send", {
            message: msg,
            roomId: currentRoom
        }, {
            headers: { Authorization: token }
        });

        msgInput.value = "";

    } catch (err) {
        alert("Message failed");
        console.log(err);
    }
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

        const myId = decodeToken(token).userId;

        res.data.forEach(msg => {
            const myId = decodeToken(token).userId;
            const type = msg.userId === myId ? "sent" : "received";

            // Sequelize 'include' often returns the object as 'User' (singular) 
            // even if the model is named 'Users'
            const username = msg.User ? msg.User.name : "Unknown";

            addMessage(msg.message, username, type)
        });

    } catch (err) {
        console.log("Error loading messages:", err);
    }
}

// ================= ADD MESSAGE =================
function addMessage(message, username, type = "received") {
    const chatBox = document.getElementById("chatMessages");

    const div = document.createElement("div");
    div.classList.add("message");

    div.style.textAlign = type === "sent" ? "right" : "left";

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

    //Smooth scroll
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: "smooth"
    });
}

// ================= SYSTEM MESSAGE =================
function addSystemMessage(msg) {
    const chatBox = document.getElementById("chatMessages");

    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.color = "gray";
    div.style.margin = "10px 0";
    div.innerText = msg;

    chatBox.appendChild(div);
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

