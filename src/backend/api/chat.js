// Route chat: /api/chat
const express = require("express");
const router = express.Router();
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const purify = DOMPurify(new JSDOM("").window);

const firestoreService = require("../services/firestoreService");
const geminiService = require("../services/geminiService");
const authenticateFirebaseToken = require("../middlewares/firebaseAuth");

// GET /api/chat/sessions - Lấy danh sách các phiên trò chuyện
router.get("/sessions", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const sessions = await firestoreService.getSessions(uid);
  res.json({ sessions });
});

// POST /api/chat/newSession - Tạo phiên mới với botStyle chỉ định
router.post("/newSession", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const { title, botStyle } = req.body;
  if (!title || !botStyle)
    return res.status(400).json({ error: "Missing title or botStyle" });
  const { sessionId } = await firestoreService.createSession(
    uid,
    title,
    botStyle
  );
  res.json({ sessionId });
});

// GET /api/chat/session/:id - Lấy toàn bộ tin nhắn trong một phiên
router.get("/session/:id", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const sessionId = req.params.id;
  const messages = await firestoreService.getSessionMessages(uid, sessionId);
  res.json({ messages });
});

// POST /api/chat/sendMessage - Gửi message đến bot, lưu và trả kết quả
router.post("/sendMessage", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const { sessionId, msg, clientAPIKey } = req.body;
  if (!sessionId || !msg)
    return res.status(400).json({ error: "Missing sessionId or msg" });
  let apiKeyToUse = clientAPIKey || process.env.GEMINI_API_KEY;
  if (!apiKeyToUse)
    return res.status(400).json({ error: "API key is missing." });

  // Kiểm tra trạng thái debugMode hiện tại
  let session = await firestoreService.getSession(uid, sessionId);
  let debugMode = session && session.debugMode ? true : false;

  // Xử lý lệnh đặc biệt
  if (msg === "you1Now2Free") {
    await firestoreService.setSessionDebugMode(uid, sessionId, true);
    debugMode = true;
  } else if (msg === "now1Come2Back") {
    await firestoreService.setSessionDebugMode(uid, sessionId, false);
    debugMode = false;
  }

  await firestoreService.saveMessage(
    uid,
    sessionId,
    "user",
    purify.sanitize(msg)
  );
  const messages = await firestoreService.getSessionMessages(uid, sessionId);

  const context = messages.map((m) => ({
    role: m.sender,
    parts: [{ text: m.content }],
  }));
  const last1000Messages = context.slice(-1000);

  try {
    const reply = purify.sanitize(
      await geminiService.sendMessageToGemini({
        msg,
        apiKey: apiKeyToUse,
        context: last1000Messages,
        debugMode,
      })
    );
    await firestoreService.saveMessage(uid, sessionId, "model", reply);
    res.status(201).json({ reply });
  } catch (err) {
    if (err.message && err.message.includes("API_KEY_INVALID")) {
      res
        .status(500)
        .json({ reply: "API key không hợp lệ, vui lòng kiểm tra lại!" });
    } else {
      res
        .status(500)
        .json({ reply: "Chatbot hiện đang bận, vui lòng thử lại!" });
      console.error(err.message);
    }
  }
});

// PATCH /api/chat/session/:id - Đổi tên session
router.patch("/session/:id", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const sessionId = req.params.id;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });
  try {
    await firestoreService.renameSession(uid, sessionId, title);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Đổi tên phiên chat thất bại!" });
  }
});

// DELETE /api/chat/session/:id - Xóa session
router.delete("/session/:id", authenticateFirebaseToken, async (req, res) => {
  const uid = req.user.uid;
  const sessionId = req.params.id;
  try {
    await firestoreService.deleteSession(uid, sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Xóa phiên chat thất bại!" });
  }
});

module.exports = router;
