const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth"); 
const messageRoutes = require("./routes/messages"); 
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// CORS set to allow everything for now to ensure the connection works
app.use(cors({
  origin: "*", 
  credentials: true
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Test route to check connection in browser
app.get("/ping", (_req, res) => {
  return res.json({ msg: "Success! Backend is online." });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.log("DB Error: ", err.message));

// Use the port Railway provides, or 5000 as a backup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

// Socket.io initialization
const io = socket(server, {
  cors: {
    origin: "*",
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => onlineUsers.set(userId, socket.id));
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) socket.to(sendUserSocket).emit("msg-recieve", data.msg);
  });
});