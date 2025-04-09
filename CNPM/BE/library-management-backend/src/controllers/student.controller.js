const Student = require('../models/student.model');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Lấy danh sách học sinh
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin một học sinh
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }
    
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tạo học sinh mới
const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, studentId, class: className } = req.body;

    // Kiểm tra email đã tồn tại
    let existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra mã học sinh đã tồn tại
    existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Mã học sinh đã tồn tại' });
    }

    // Tạo học sinh mới
    const student = new Student({
      email,
      password,
      firstName,
      lastName,
      phone,
      studentId,
      class: className
    });

    await student.save();

    res.status(201).json({
      id: student._id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      studentId: student.studentId,
      class: student.class
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin học sinh
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, class: className } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    // Cập nhật thông tin
    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.phone = phone || student.phone;
    student.class = className || student.class;

    await student.save();
    
    res.json({
      id: student._id,
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      studentId: student.studentId,
      class: student.class
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa học sinh
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy học sinh' });
    }

    await student.remove();
    
    res.json({ message: 'Đã xóa học sinh thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đăng nhập học sinh
const loginStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Tìm học sinh
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = jwt.sign(
      { studentId: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      student: {
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        class: student.class
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  loginStudent
}; 