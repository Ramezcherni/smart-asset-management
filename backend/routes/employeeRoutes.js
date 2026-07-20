const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent d'être connecté
router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('Admin'), createEmployee);

router.route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

module.exports = router;