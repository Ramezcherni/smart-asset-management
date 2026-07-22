const express = require('express');
const router = express.Router();
const {
  registerUser,
  createUser,
  loginUser,
  getUsers,
  updateUserRole,
  updateProfile,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/create-user', protect, authorize('Admin'), createUser);
router.get('/users', protect, authorize('Admin'), getUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.put('/profile', protect, updateProfile);

router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;