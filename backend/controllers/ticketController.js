const Ticket = require('../models/Ticket');
const { logAction } = require('../utils/auditLogger');

// @desc    Créer un ticket
// @route   POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { title, description, asset, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      asset: asset || null,
      priority: priority || 'Medium',
      createdBy: req.user._id,
    });

    await logAction(req.user._id, 'CREATE', 'Ticket', ticket._id, `Created ticket "${ticket.title}"`);

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('asset');

    res.status(201).json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer les tickets
// @route   GET /api/tickets
const getTickets = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'Employee') {
      filter.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('asset')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un ticket précis
// @route   GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('asset');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role === 'Employee' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    S'assigner un ticket (Technician/Admin)
// @route   PUT /api/tickets/:id/assign
const assignTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = req.user._id;
    ticket.status = 'In Progress';
    await ticket.save();

    await logAction(req.user._id, 'ASSIGN', 'Ticket', ticket._id, `Assigned ticket "${ticket.title}" to self`);

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('asset');

    res.json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Changer le statut d'un ticket (Technician/Admin)
// @route   PUT /api/tickets/:id/status
const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    if (!['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    await logAction(
      req.user._id,
      'UPDATE_STATUS',
      'Ticket',
      ticket._id,
      `Changed ticket "${ticket.title}" status to ${status}`
    );

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('asset');

    res.json(populatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un ticket (Admin seulement)
// @route   DELETE /api/tickets/:id
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  deleteTicket,
};