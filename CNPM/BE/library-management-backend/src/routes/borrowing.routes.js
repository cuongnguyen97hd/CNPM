const express = require('express');
const router = express.Router();
const { getBorrowings, getBorrowingById, createBorrowing, returnBooks } = require('../controllers/borrowing.controller');
const { auth, isStaff } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Validation middleware
const borrowingValidation = [
  body('studentId').notEmpty().withMessage('ID học sinh không được để trống'),
  body('books').isArray().withMessage('Danh sách sách phải là một mảng'),
  body('books.*.book').notEmpty().withMessage('ID sách không được để trống'),
  body('books.*.quantity').isInt({ min: 1 }).withMessage('Số lượng sách phải lớn hơn 0'),
  body('dueDate').isISO8601().withMessage('Ngày trả không hợp lệ')
];

// Routes
router.get('/', auth, getBorrowings);
router.get('/:id', auth, getBorrowingById);
router.post('/', auth, isStaff, borrowingValidation, createBorrowing);
router.put('/:id/return', auth, isStaff, returnBooks);

module.exports = router; 