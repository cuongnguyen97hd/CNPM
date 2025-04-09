const User = require('../models/user.model');
const { validationResult } = require('express-validator');

// Lấy danh sách người dùng theo role
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin một người dùng
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật thông tin
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await user.remove();
    
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}; 