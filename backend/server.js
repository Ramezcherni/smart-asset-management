const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Enregistre les modèles Mongoose
require('./models/User');
require('./models/Asset');
require('./models/Employee');
require('./models/Assignment');
require('./models/Ticket');
require('./models/AuditLog');

const app = express();

// Middlewares — DOIVENT être déclarés EN PREMIER
app.use(cors());
app.use(express.json());

// Routes — déclarées APRÈS les middlewares
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const assetRoutes = require('./routes/assetRoutes');
app.use('/api/assets', assetRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);

const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignments', assignmentRoutes);

const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

const auditLogRoutes = require('./routes/auditLogRoutes');
app.use('/api/audit-logs', auditLogRoutes);

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