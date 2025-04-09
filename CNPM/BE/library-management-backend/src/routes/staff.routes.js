const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const staffController = require('../controllers/staff.controller');
const auth = require('../middleware/auth');

// Validation middleware
const validateStaff = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Tên không được để trống'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Họ không được để trống'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Số điện thoại không được để trống')
];

// Validation middleware cho cập nhật (không yêu cầu password)
const validateStaffUpdate = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Tên không được để trống'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Họ không được để trống'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Số điện thoại không được để trống')
];

// Routes
router.get('/', auth, staffController.getStaffs);
router.get('/:id', auth, staffController.getStaffById);
router.post('/', validateStaff, staffController.createStaff);
router.put('/:id', auth, validateStaffUpdate, staffController.updateStaff);
router.delete('/:id', auth, staffController.deleteStaff);

module.exports = router; 