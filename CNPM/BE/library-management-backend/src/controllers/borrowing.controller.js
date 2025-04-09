const Borrowing = require('../models/borrowing.model');
const Book = require('../models/book.model');
const { validationResult } = require('express-validator');

// Lấy danh sách phiếu mượn
const getBorrowings = async (req, res) => {
  try {
    const { status, studentId } = req.query;
    let query = {};
    
    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }
    
    // Lọc theo học sinh
    if (studentId) {
      query.student = studentId;
    }
    
    const borrowings = await Borrowing.find(query)
      .populate('student', 'firstName lastName email')
      .populate('books.book', 'title author')
      .populate('createdBy', 'firstName lastName')
      .sort({ borrowDate: -1 });
    
    res.json(borrowings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin một phiếu mượn
const getBorrowingById = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('books.book', 'title author')
      .populate('createdBy', 'firstName lastName');
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }
    
    res.json(borrowing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo phiếu mượn mới
const createBorrowing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, books, dueDate } = req.body;
    
    // Kiểm tra số lượng sách có sẵn
    for (const item of books) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Không tìm thấy sách với ID: ${item.book}` });
      }
      
      if (book.availableQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Sách "${book.title}" không đủ số lượng. Còn lại: ${book.availableQuantity}` 
        });
      }
      
      // Cập nhật số lượng sách có sẵn
      book.availableQuantity -= item.quantity;
      await book.save();
    }
    
    const borrowing = new Borrowing({
      student: studentId,
      books,
      dueDate,
      createdBy: req.user._id
    });

    await borrowing.save();
    
    // Populate thông tin chi tiết
    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('student', 'firstName lastName email')
      .populate('books.book', 'title author')
      .populate('createdBy', 'firstName lastName');
    
    res.status(201).json(populatedBorrowing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật trạng thái phiếu mượn (trả sách)
const returnBooks = async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id);
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }
    
    if (borrowing.status === 'returned') {
      return res.status(400).json({ message: 'Phiếu mượn đã được trả sách' });
    }
    
    // Cập nhật số lượng sách có sẵn
    for (const item of borrowing.books) {
      const book = await Book.findById(item.book);
      book.availableQuantity += item.quantity;
      await book.save();
    }
    
    // Cập nhật trạng thái phiếu mượn
    borrowing.status = 'returned';
    borrowing.returnDate = new Date();
    await borrowing.save();
    
    // Populate thông tin chi tiết
    const populatedBorrowing = await Borrowing.findById(borrowing._id)
      .populate('student', 'firstName lastName email')
      .populate('books.book', 'title author')
      .populate('createdBy', 'firstName lastName');
    
    res.json(populatedBorrowing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getBorrowings,
  getBorrowingById,
  createBorrowing,
  returnBooks
}; 