const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// --- 1. CORS CONFIGURATION ---
// This allows your Vercel frontend to talk to this Railway backend
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chit-chat-five-phi.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

// --- 2. DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log("DB Connection Error: ", err.message);
  });

// --- 3. ROUTES ---
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful - Backend is Live!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// --- 4. SERVER INITIALIZATION ---
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);

// --- 5. SOCKET.IO SETUP ---
// We also need to allow the Vercel URL here for the real-time chat
const io = socket(server, {
  cors: {
    origin: ["http://localhost:3000", "https://chit-chat-five-phi.vercel.app"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});