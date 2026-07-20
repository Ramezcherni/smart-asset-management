const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares — DOIVENT être déclarés EN PREMIER
app.use(cors());
app.use(express.json());

// Routes — déclarées APRÈS les middlewares
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB connection error ❌', err));

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});