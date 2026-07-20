const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Route de test protégée — accessible seulement si connecté
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

// Route de test réservée aux Admins uniquement
router.get('/admin-only', protect, authorize('Admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

module.exports = router;