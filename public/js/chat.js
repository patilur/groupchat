// public/js/chat.js

// ================= INIT =================
const token = localStorage.getItem("token");

// Best Practice: Pass the token during the initial connection for middleware authentication
const socket = io("http://localhost:3000", {
    auth: { token }
});

let currentRoom = null;
let activeChatType = 'personal'; // Tracks if current view is a 1-on-1 or Group

// ================= UTILITIES =================
function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return {};
    }
}

// ================= SOCKET LISTENERS =================
socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
});

// Best Practice: Centralized listener for all message types (Personal and Group)
socket.on("receive_message", (msg) => {
    // Only display the message if it belongs to the room the user is currently viewing
    if (msg.roomId === currentRoom) {
        const myId = decodeToken(token).userId;
        const type = msg.user.id === myId ? "sent" : "received";
        addMessage(msg.message, msg.user.name, type);
    }
});

socket.on("user_connected", (data) => {
    addSystemMessage(data.message);
});

// ================= PERSONAL CHAT LOGIC =================
async function startChat() {
    const searchedEmail = document.getElementById("searchEmail").value.trim();
    const myEmail = localStorage.getItem("email");

    if (!searchedEmail || searchedEmail === myEmail) return alert("Invalid email");

    try {
        // Prevent Dummy Emails: Verify user exists before joining
        const response = await axios.get(`http://localhost:3000/user/search?email=${searchedEmail}`, {
            headers: { Authorization: token }
        });

        const userExists = response.data.find(u => u.email === searchedEmail);
        if (!userExists) return alert("User not found in database.");

        activeChatType = 'personal';
        // Unique Room ID: Sort identifiers alphabetically for consistency
        currentRoom = [myEmail, searchedEmail].sort().join("_");

        document.getElementById("chatHeaderTitle").innerText = `Chat with ${searchedEmail}`;
        document.getElementById("addMemberBtn").style.display = "none"; // Hide group tools

        socket.emit("join_room", currentRoom);
        loadMessages(currentRoom);
    } catch (err) {
        alert("Verification failed");
    }
}

// ================= GROUP CHAT LOGIC =================
async function createGroup() {
    const name = prompt("Enter Group Name:");
    if (!name) return;

    try {
        const res = await axios.post("http://localhost:3000/chat/groups", { name }, {
            headers: { Authorization: token }
        });
        alert("Group Created!");
        // Refresh sidebar and join the new group
        location.reload();
    } catch (err) {
        alert("Error creating group");
    }
}

function joinGroup(groupId, groupName) {
    activeChatType = 'group';
    currentRoom = `group_${groupId}`; // Namespacing group rooms

    document.getElementById("chatHeaderTitle").innerText = `Group: ${groupName}`;
    document.getElementById("addMemberBtn").style.display = "block"; // Show group tools

    socket.emit("join_room", currentRoom);
    loadMessages(currentRoom);
}

// public/js/chat.js

async function inviteMember() {
    const email = prompt("Enter user email to invite:");

    // Safety checks
    if (!email || !currentRoom || !currentRoom.startsWith('group_')) return;

    const groupId = currentRoom.split('_')[1];

    try {
        // FIX: Added 'const res =' to capture the response
        const res = await axios.post("http://localhost:3000/chat/groups/add-member",
            { groupId, userEmail: email },
            { headers: { Authorization: token } }
        );

        // This will now work correctly
        alert(res.data.message);
    } catch (err) {
        // This catches 400 (already member), 404 (not found), or 500 errors
        console.error("Invite Error:", err);
        alert(err.response?.data?.message || "Failed to add member");
    }
}

// ================= CORE MESSAGING =================
async function sendMessage() {
    const msgInput = document.getElementById("messageInput");
    const msg = msgInput.value.trim();

    if (!msg || !currentRoom) return;

    const payload = {
        message: msg,
        roomId: currentRoom,
        type: activeChatType
    };

    // Best Practice: Use Socket.IO Acknowledgments instead of REST for messages
    // This confirms the server saved the message before clearing the input
    socket.emit("send_message", payload, (response) => {
        if (response.status === "ok") {
            msgInput.value = "";
        } else {
            alert("Message failed to send");
        }
    });
}

async function loadMessages(roomId) {
    try {
        const res = await axios.get(`http://localhost:3000/chat/${roomId}`, {
            headers: { Authorization: token }
        });
        const chatBox = document.getElementById("chatMessages");
        chatBox.innerHTML = "";

        const myId = decodeToken(token).userId;
        res.data.forEach(msg => {
            const type = msg.userId === myId ? "sent" : "received";
            // Support both Sequelize 'User' (singular) and 'user' (lowercase)
            const username = msg.User?.name || msg.user?.name || "Unknown";
            addMessage(msg.message, username, type);
        });
    } catch (err) {
        console.error("Error loading history:", err);
    }
}

// ================= UI RENDERING =================
function addMessage(message, username, type) {
    const chatBox = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.classList.add("message", type);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
        <div class="bubble">
            <strong>${username}</strong><br>
            ${message}<br>
            <span class="timestamp">${time}</span>
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemMessage(msg) {
    const chatBox = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.style.textAlign = "center";
    div.style.color = "gray";
    div.style.fontSize = "12px";
    div.innerText = msg;
    chatBox.appendChild(div);
}

// Best Practice: Load user's group list on page load
window.onload = async () => {
    if (!token) return;
    try {
        const res = await axios.get("http://localhost:3000/chat/groups", {
            headers: { Authorization: token }
        });
        const groupList = document.getElementById("groupList");
        groupList.innerHTML = "";
        res.data.forEach(group => {
            const div = document.createElement("div");
            div.className = "list-item";
            div.innerText = group.name;
            div.onclick = () => joinGroup(group.id, group.name);
            groupList.appendChild(div);
        });
    } catch (err) {
        console.error("Error fetching groups:", err);
    }
};
// public/js/chat.js

// public/js/chat.js

async function searchUsers() {
    const query = document.getElementById("searchEmail").value.trim();
    const suggestions = document.getElementById("emailSuggestions");
    const myEmail = localStorage.getItem("email"); // Get your own email

    if (query.length < 2) {
        suggestions.innerHTML = "";
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/user/search?email=${query}`, {
            headers: { Authorization: token }
        });

        const users = response.data;
        suggestions.innerHTML = "";

        users.forEach(user => {
            // Only add to dropdown if it's NOT the current user
            if (user.email !== myEmail) {
                const option = document.createElement("option");
                option.value = user.email;
                option.innerText = user.name;
                suggestions.appendChild(option);
            }
        });
    } catch (err) {
        console.error("Search error:", err);
    }
}