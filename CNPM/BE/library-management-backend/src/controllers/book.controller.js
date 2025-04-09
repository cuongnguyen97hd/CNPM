const { Book, BOOK_CATEGORIES } = require('../models/book.model');
const Borrowing = require('../models/borrowing.model');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Hàm xóa file ảnh
const deleteImageFile = async (imagePath) => {
  try {
    if (!imagePath) return;
    // Chuyển đổi đường dẫn tương đối thành tuyệt đối
    const fullPath = path.resolve(__dirname, '../../public', imagePath.replace(/^\//, ''));
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
  }
};

// Kiểm tra sách có đang được mượn
const isBookBorrowed = async (bookId) => {
  const borrowing = await Borrowing.findOne({
    'books.book': bookId,
    status: { $in: ['borrowed', 'overdue'] }
  });
  return !!borrowing;
};

// Lấy danh sách sách
const getBooks = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Xây dựng query
    let query = {};
    
    // Lọc theo danh mục
    if (category) {
      query.category = category;
    }
    
    // Tìm kiếm theo từ khóa
    if (search) {
      query.$text = { $search: search };
    }

    // Tính toán skip cho phân trang
    const skip = (page - 1) * limit;
    
    // Thực hiện query với phân trang và sắp xếp
    const books = await Book.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số sách thỏa mãn điều kiện
    const total = await Book.countDocuments(query);
    
    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      categories: BOOK_CATEGORIES
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin một cuốn sách
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Lấy thông tin mượn sách
    const borrowings = await Borrowing.find({
      'books.book': book._id,
      status: { $in: ['borrowed', 'overdue'] }
    })
    .populate('student', 'firstName lastName email')
    .select('student borrowDate dueDate status');
    
    res.json({
      ...book.toJSON(),
      borrowings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm sách mới
const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookData = {
      ...req.body,
      quantity: parseInt(req.body.quantity),
      availableQuantity: parseInt(req.body.quantity)
    };

    if (req.file) {
      bookData.coverImage = req.file.path.replace('public', '');
    }

    const book = new Book(bookData);
    await book.save();
    
    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN đã tồn tại trong hệ thống' });
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin sách
const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Kiểm tra số lượng sách có thể giảm
    const newQuantity = parseInt(req.body.quantity);
    if (newQuantity !== undefined && newQuantity < book.borrowedQuantity) {
      return res.status(400).json({ 
        message: 'Không thể giảm số lượng sách dưới số lượng đang được mượn' 
      });
    }

    // Cập nhật thông tin
    Object.keys(req.body).forEach(key => {
      if (key !== 'availableQuantity') { // Không cho phép cập nhật trực tiếp availableQuantity
        book[key] = req.body[key];
      }
    });

    if (req.file) {
      // Xóa ảnh cũ
      if (book.coverImage) {
        await deleteImageFile(book.coverImage);
      }
      book.coverImage = req.file.path.replace('public', '');
    }

    await book.save();
    res.json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'ISBN đã tồn tại trong hệ thống' });
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa sách
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    // Kiểm tra sách có đang được mượn
    if (book.borrowedQuantity > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa sách đang được mượn' 
      });
    }

    // Xóa ảnh
    if (book.coverImage) {
      await deleteImageFile(book.coverImage);
    }

    // Xóa sách khỏi database
    await Book.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Xóa sách thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách thể loại sách
const getCategories = (req, res) => {
  res.json(BOOK_CATEGORIES);
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories
}; 