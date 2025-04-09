const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { auth, isStaff } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('Tên không được để trống'),
  body('lastName').optional().notEmpty().withMessage('Họ không được để trống'),
  body('phone').optional().notEmpty().withMessage('Số điện thoại không được để trống')
];

// Routes
router.get('/', auth, isStaff, getUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUserValidation, updateUser);
router.delete('/:id', auth, isStaff, deleteUser);

module.exports = router; 