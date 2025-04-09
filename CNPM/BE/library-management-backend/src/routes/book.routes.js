const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getBooks, getBookById, createBook, updateBook, deleteBook, getCategories } = require('../controllers/book.controller');
const { auth, isStaff } = require('../middleware/auth.middleware');
const { body, query } = require('express-validator');
const { BOOK_CATEGORIES } = require('../models/book.model');

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/books'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
  }
});

// Query validation
const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Giới hạn phải là số nguyên dương'),
  query('sortBy').optional().isIn(['title', 'author', 'category', 'createdAt']).withMessage('Trường sắp xếp không hợp lệ'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Thứ tự sắp xếp không hợp lệ'),
  query('category').optional().isIn(BOOK_CATEGORIES).withMessage('Thể loại không hợp lệ')
];

// Book validation
const bookValidation = [
  body('title')
    .notEmpty().withMessage('Tiêu đề không được để trống')
    .isLength({ max: 200 }).withMessage('Tiêu đề không được vượt quá 200 ký tự'),
  body('author')
    .notEmpty().withMessage('Tác giả không được để trống')
    .isLength({ max: 100 }).withMessage('Tên tác giả không được vượt quá 100 ký tự'),
  body('category')
    .notEmpty().withMessage('Thể loại không được để trống')
    .isIn(BOOK_CATEGORIES).withMessage('Thể loại không hợp lệ'),
  body('quantity')
    .notEmpty().withMessage('Số lượng không được để trống')
    .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên không âm'),
  body('publishDate')
    .notEmpty().withMessage('Ngày xuất bản không được để trống')
    .isISO8601().withMessage('Ngày xuất bản không hợp lệ')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Ngày xuất bản không thể là ngày trong tương lai');
      }
      return true;
    }),
  body('isbn')
    .optional()
    .matches(/^(?:\d{10}|\d{13})$/).withMessage('ISBN phải có 10 hoặc 13 chữ số'),
  body('publisher')
    .optional()
    .isLength({ max: 100 }).withMessage('Tên nhà xuất bản không được vượt quá 100 ký tự'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Mô tả không được vượt quá 2000 ký tự')
];

// Routes
router.get('/categories', auth, getCategories);
router.get('/', auth, listValidation, getBooks);
router.get('/:id', auth, getBookById);
router.post('/', auth, isStaff, upload.single('coverImage'), bookValidation, createBook);
router.put('/:id', auth, isStaff, upload.single('coverImage'), bookValidation, updateBook);
router.delete('/:id', auth, isStaff, deleteBook);

module.exports = router; 