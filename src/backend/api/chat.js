// Route chat: /api/chat
const express = require("express");
const router = express.Router();
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const purify = DOMPurify(new JSDOM("").window);

const firestoreService = require("../services/firestoreService");
const geminiService = require("../services/geminiService");
const authenticateFirebaseToken = require("../middlewares/firebaseAuth");

const ALLOWED_BOT_STYLES = ["default", "creative", "concise"];

function isValidTitle(title) {
  return (
    typeof title === "string" && title.trim().length > 0 && title.length <= 100
  );
}
function isValidBotStyle(style) {
  return typeof style === "string" && ALLOWED_BOT_STYLES.includes(style);
}
function isValidMsg(msg) {
  return typeof msg === "string" && msg.trim().length > 0 && msg.length <= 2000;
}

// GET /api/chat/sessions - Lấy danh sách các phiên trò chuyện
router.get("/sessions", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessions = await firestoreService.getSessions(uid);
    res.json({ sessions });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi lấy danh sách phiên chat", detail: err.message });
  }
});

// POST /api/chat/newSession - Tạo phiên mới với botStyle chỉ định
router.post("/newSession", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, botStyle } = req.body;
    if (!isValidTitle(title))
      return res.status(400).json({ error: "Missing or invalid title" });
    if (!isValidBotStyle(botStyle))
      return res.status(400).json({ error: "Missing or invalid botStyle" });
    const { sessionId } = await firestoreService.createSession(
      uid,
      title.trim(),
      botStyle
    );
    res.json({ sessionId });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi tạo phiên chat mới", detail: err.message });
  }
});

// GET /api/chat/session/:id - Lấy toàn bộ tin nhắn trong một phiên
router.get("/session/:id", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });
    const messages = await firestoreService.getSessionMessages(uid, sessionId);
    const session = await firestoreService.getSession(uid, sessionId);
    res.json({
      messages,
      sessionTitle: session && session.title ? session.title : undefined,
      sessionBotStyle:
        session && session.botStyle ? session.botStyle : "default",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Lỗi lấy tin nhắn phiên chat", detail: err.message });
  }
});

// POST /api/chat/sendMessage - Gửi message đến bot, lưu và trả kết quả
router.post("/sendMessage", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sessionId, msg, clientAPIKey } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });
    if (!isValidMsg(msg))
      return res.status(400).json({ error: "Missing or invalid msg" });
    let apiKeyToUse = clientAPIKey || process.env.GEMINI_API_KEY;
    if (!apiKeyToUse)
      return res.status(400).json({ error: "API key is missing." });

    // Kiểm tra trạng thái debugMode hiện tại
    let session = await firestoreService.getSession(uid, sessionId);
    let debugMode = session && session.debugMode ? true : false;
    let botStyle = session && session.botStyle ? session.botStyle : "default";
    if (!isValidBotStyle(botStyle)) botStyle = "default";

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
          botStyle,
        })
      );
      await firestoreService.saveMessage(uid, sessionId, "model", reply);
      res.status(201).json({ reply });
    } catch (err) {
      if (err.message && err.message.includes("API_KEY_INVALID")) {
        res.status(500).json({
          reply: "API key không hợp lệ, vui lòng kiểm tra lại!",
          detail: err.message,
        });
      } else {
        res.status(500).json({
          reply: "Chatbot hiện đang bận, vui lòng thử lại!",
          detail: err.message,
        });
        console.error(err.message);
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Lỗi gửi tin nhắn", detail: err.message });
  }
});

// PATCH /api/chat/session/:id - Đổi tên session hoặc botStyle
router.patch("/session/:id", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;
    const { title, botStyle } = req.body;
    if (!title && !botStyle)
      return res.status(400).json({ error: "Missing title or botStyle" });
    if (title && !isValidTitle(title))
      return res.status(400).json({ error: "Invalid title" });
    if (botStyle && !isValidBotStyle(botStyle))
      return res.status(400).json({ error: "Invalid botStyle" });
    if (title) await firestoreService.renameSession(uid, sessionId, title);
    if (botStyle)
      await firestoreService.setSessionBotStyle(uid, sessionId, botStyle);
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Cập nhật session thất bại!", detail: err.message });
  }
});

// DELETE /api/chat/session/:id - Xóa session
router.delete("/session/:id", authenticateFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });
    await firestoreService.deleteSession(uid, sessionId);
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Xóa phiên chat thất bại!", detail: err.message });
  }
});

module.exports = router;
