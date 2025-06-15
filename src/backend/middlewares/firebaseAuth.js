const admin = require("firebase-admin");

module.exports = async function authenticateFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ")
    ? authHeader.split("Bearer ")[1]
    : null;
  if (!idToken) return res.status(401).json({ error: "No token provided" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
