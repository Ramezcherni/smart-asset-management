const Employee = require('../models/Employee');

// @desc    Créer un nouvel employé
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les employés
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un employé par son ID
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Modifier un employé
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un employé
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer SA PROPRE fiche employee (liée par email)
// @route   GET /api/employees/me
const getMyEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found yet' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Modifier SES PROPRES infos (department, position, phone)
// @route   PUT /api/employees/me
const updateMyEmployeeProfile = async (req, res) => {
  try {
    const { department, position, phone } = req.body;

    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ message: 'No employee profile found yet' });
    }

    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (phone !== undefined) employee.phone = phone;

    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
};