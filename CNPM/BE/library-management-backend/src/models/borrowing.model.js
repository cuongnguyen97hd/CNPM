const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  books: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue'],
    default: 'borrowed'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Tự động cập nhật trạng thái khi quá hạn
borrowingSchema.methods.checkOverdue = function() {
  if (this.status === 'borrowed' && this.dueDate < new Date()) {
    this.status = 'overdue';
    return true;
  }
  return false;
};

const Borrowing = mongoose.model('Borrowing', borrowingSchema);

module.exports = Borrowing; 