const mongoose = require('mongoose');

const BOOK_CATEGORIES = [
  'Giáo trình',
  'Sách tham khảo',
  'Tạp chí khoa học',
  'Luận văn/Luận án',
  'Khác'
];

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề sách là bắt buộc'],
    trim: true,
    maxLength: [200, 'Tiêu đề sách không được vượt quá 200 ký tự'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: [2000, 'Mô tả sách không được vượt quá 2000 ký tự']
  },
  author: {
    type: String,
    required: [true, 'Tên tác giả là bắt buộc'],
    trim: true,
    maxLength: [100, 'Tên tác giả không được vượt quá 100 ký tự'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Thể loại sách là bắt buộc'],
    enum: {
      values: BOOK_CATEGORIES,
      message: 'Thể loại sách không hợp lệ'
    },
    index: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng sách là bắt buộc'],
    min: [0, 'Số lượng sách không được âm'],
    validate: {
      validator: Number.isInteger,
      message: 'Số lượng sách phải là số nguyên'
    }
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: [0, 'Số lượng sách có sẵn không được âm'],
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Số lượng sách có sẵn không thể lớn hơn tổng số lượng'
    }
  },
  publishDate: {
    type: Date,
    required: [true, 'Ngày xuất bản là bắt buộc'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Ngày xuất bản không thể là ngày trong tương lai'
    }
  },
  isbn: {
    type: String,
    trim: true,
    maxLength: [13, 'ISBN không hợp lệ'],
    match: [/^(?:\d{10}|\d{13})$/, 'ISBN phải có 10 hoặc 13 chữ số'],
    sparse: true,
    unique: true
  },
  publisher: {
    type: String,
    trim: true,
    maxLength: [100, 'Tên nhà xuất bản không được vượt quá 100 ký tự']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Tự động cập nhật availableQuantity khi quantity thay đổi
bookSchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    // Tính toán số sách đang được mượn
    const borrowedBooks = this.quantity - this.availableQuantity;
    // Cập nhật availableQuantity mới
    this.availableQuantity = Math.max(0, this.quantity - borrowedBooks);
  }
  next();
});

// Virtual field cho số sách đang được mượn
bookSchema.virtual('borrowedQuantity').get(function() {
  return this.quantity - this.availableQuantity;
});

// Phương thức kiểm tra có thể mượn thêm
bookSchema.methods.canBorrow = function(requestedQuantity) {
  return this.availableQuantity >= requestedQuantity;
};

const Book = mongoose.model('Book', bookSchema);

module.exports = {
  Book,
  BOOK_CATEGORIES
}; 