const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage('Mật khẩu phải chứa cả chữ và số'),
  body('firstName').notEmpty().withMessage('Tên không được để trống'),
  body('lastName').notEmpty().withMessage('Họ không được để trống'),
  body('role').isIn(['student', 'staff']).withMessage('Vai trò không hợp lệ')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

module.exports = router; 