const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
require("dotenv").config();

// Fix: Since index.js is INSIDE /routes, 
// we just use "./auth" instead of "./routes/auth"
const authRoutes = require("./auth"); 
const messageRoutes = require("./messages"); 

const app = express();

// Allow all origins to fix the CORS issue immediately
app.use(cors({
  origin: "*", 
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Backend is finally connected!" });
});

// DB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => console.log("DB Error: ", err.message));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);

const io = socket(server, {
  cors: { origin: "*" },
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