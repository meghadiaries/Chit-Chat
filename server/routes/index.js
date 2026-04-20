const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");
require("dotenv").config();

const app = express();

// --- THE FIX: Updated CORS for Vercel ---
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chit-chat-five-phi.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Backend is Live!" });
});

// --- DATABASE CONNECTION ---
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

// --- SERVER START ---
const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);

// --- SOCKET.IO FIX ---
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