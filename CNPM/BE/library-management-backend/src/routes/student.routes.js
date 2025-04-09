const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, loginStudent } = require('../controllers/student.controller');
const { auth, isStaff } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const studentValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('firstName').notEmpty().withMessage('Tên không được để trống'),
  body('lastName').notEmpty().withMessage('Họ không được để trống'),
  body('studentId').notEmpty().withMessage('Mã học sinh không được để trống')
];

const updateStudentValidation = [
  body('firstName').optional().notEmpty().withMessage('Tên không được để trống'),
  body('lastName').optional().notEmpty().withMessage('Họ không được để trống'),
  body('phone').optional().notEmpty().withMessage('Số điện thoại không được để trống'),
  body('class').optional().notEmpty().withMessage('Lớp không được để trống')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
];

// Routes
router.get('/', auth, isStaff, getStudents);
router.get('/:id', auth, getStudentById);
router.post('/', auth, isStaff, studentValidation, createStudent);
router.put('/:id', auth, updateStudentValidation, updateStudent);
router.delete('/:id', auth, isStaff, deleteStudent);
router.post('/login', loginValidation, loginStudent);

module.exports = router; 