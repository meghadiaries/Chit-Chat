const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
require("dotenv").config();

// Relative paths are now correct because this file is in the 'routes' folder
const authRoutes = require("./auth"); 
const messageRoutes = require("./messages");

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err.message);
  });

// --- ROUTES ---

// 1. Root Route (Fixes the "Cannot GET /" error)
app.get("/", (req, res) => {
  res.send("Chat App Backend is Live and Running!");
});

// 2. Health Check Route
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

// 3. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// --- SERVER START ---

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// --- SOCKET.IO SETUP ---

const io = socket(server, {
  cors: {
    origin: "*", // Allows your frontend to connect from any URL (Railway, Vercel, etc.)
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