const admin = require("firebase-admin");

module.exports = {
  async verifyIdToken(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        userId: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
    } catch (err) {
      throw new Error("Invalid token");
    }
  },
};
