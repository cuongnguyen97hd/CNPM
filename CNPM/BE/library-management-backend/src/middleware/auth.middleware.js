const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware xác thực token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra quyền admin
const isStaff = async (req, res, next) => {
  try {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { auth, isStaff }; 