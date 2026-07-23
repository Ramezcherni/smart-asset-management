const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  deleteTicket,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(createTicket); // Tout le monde peut créer un ticket

router.get('/:id', getTicketById);

router.put('/:id/assign', authorize('Admin', 'Technician'), assignTicket);
router.put('/:id/status', authorize('Admin', 'Technician'), updateTicketStatus);
router.delete('/:id', authorize('Admin'), deleteTicket);

module.exports = router;