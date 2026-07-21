const express = require('express');
const router = express.Router();
const {
  registerUser,
  createUser,
  loginUser,
  getUsers,
  updateUserRole,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public — crée toujours un compte "Employee"
router.post('/register', registerUser);

// Public — connexion
router.post('/login', loginUser);

// Protégé — seul un Admin peut créer un compte avec un rôle choisi
router.post('/create-user', protect, authorize('Admin'), createUser);

// Protégé — Admin seulement : voir tous les utilisateurs
router.get('/users', protect, authorize('Admin'), getUsers);

// Protégé — Admin seulement : changer le rôle d'un utilisateur
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);

// Route de test protégée
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Welcome to your profile', user: req.user });
});

module.exports = router;