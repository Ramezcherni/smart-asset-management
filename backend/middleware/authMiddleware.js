const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Le token est envoyé dans le header : Authorization: Bearer xxxxx
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Vérifie et décode le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupère l'utilisateur (sans le mot de passe) et l'attache à req
      req.user = await User.findById(decoded.id).select('-password');

      next(); // passe à la suite (la route demandée)
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware pour restreindre l'accès selon le rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };