const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = {
  // Lưu message vào một session cụ thể
  async saveMessage(uid, sessionId, role, msg) {
    await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .collection("messages")
      .add({
        sender: role,
        content: msg,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  },
  // Lấy danh sách các session của user
  async getSessions(uid) {
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  // Tạo session mới
  async createSession(uid, title, botStyle) {
    const sessionRef = await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .add({
        title,
        botStyle,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return { sessionId: sessionRef.id };
  },
  // Lấy toàn bộ tin nhắn trong một session
  async getSessionMessages(uid, sessionId) {
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
  // Đổi tên session
  async renameSession(uid, sessionId, newTitle) {
    await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .update({ title: newTitle });
  },
  // Xóa session và toàn bộ messages bên trong
  async deleteSession(uid, sessionId) {
    const sessionRef = db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId);
    // Xóa toàn bộ messages
    const messagesSnap = await sessionRef.collection("messages").get();
    const batch = db.batch();
    messagesSnap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    // Xóa session
    await sessionRef.delete();
  },
  // Lấy thông tin một session cụ thể
  async getSession(uid, sessionId) {
    const doc = await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },
  // Cập nhật trạng thái debugMode cho session
  async setSessionDebugMode(uid, sessionId, debugMode) {
    await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .update({ debugMode });
  },
  // Cập nhật botStyle cho session
  async setSessionBotStyle(uid, sessionId, botStyle) {
    await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .update({ botStyle });
  },
  // Cập nhật trạng thái chờ trả lời cho session
  async setSessionPendingReply(uid, sessionId, isPending) {
    await db
      .collection("users")
      .doc(uid)
      .collection("sessions")
      .doc(sessionId)
      .update({ isPendingReply: isPending });
  },
};
