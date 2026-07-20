const express = require('express');
const router = express.Router();
const {
  createAssignment,
  returnAssignment,
  getAssignments,
  getAssignmentsByAsset,
  getAssignmentsByEmployee,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('Admin', 'Technician'), createAssignment);

router.put('/:id/return', authorize('Admin', 'Technician'), returnAssignment);

router.get('/asset/:assetId', getAssignmentsByAsset);
router.get('/employee/:employeeId', getAssignmentsByEmployee);

module.exports = router;