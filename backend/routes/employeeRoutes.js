const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Routes "me" AVANT les routes avec :id
router.get('/me', getMyEmployeeProfile);
router.put('/me', updateMyEmployeeProfile);

router.route('/')
  .get(getEmployees)
  .post(authorize('Admin'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

module.exports = router;