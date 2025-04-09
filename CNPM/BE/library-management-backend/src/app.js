const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load biến môi trường
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/books', require('./routes/book.routes'));
app.use('/api/borrowings', require('./routes/borrowing.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/staffs', require('./routes/staff.routes'));

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi!' });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
