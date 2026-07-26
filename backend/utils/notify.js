const Notification = require('../models/Notification');

// io est injecté depuis server.js pour éviter les dépendances circulaires
let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

const notifyUser = async (userId, message, link = '') => {
  try {
    const notification = await Notification.create({ user: userId, message, link });

    // Pousse en temps réel si l'utilisateur est connecté au socket
    if (ioInstance) {
      ioInstance.to(userId.toString()).emit('notification', notification);
    }
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = { setIo, notifyUser };