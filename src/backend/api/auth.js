// Route auth
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'No token provided' });
  try {
    const user = await authService.verifyIdToken(idToken);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
