const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();

// Firebase init
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // tối đa 60 request/phút/IP
  message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau!" },
});

app.use("/api/", apiLimiter);

// Import routes
const authRoutes = require("./api/auth");
app.use("/api/auth", authRoutes);

const chatRoutes = require("./api/chat");
app.use("/api/chat", chatRoutes);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/login.html"));
});

app.get("/chat/:sessionId", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;
