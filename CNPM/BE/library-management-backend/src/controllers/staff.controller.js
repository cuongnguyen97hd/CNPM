const Staff = require('../models/staff.model');
const { validationResult } = require('express-validator');

// Lấy danh sách nhân viên
const getStaffs = async (req, res) => {
    try {
        const staffs = await Staff.find();
        res.json(staffs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thông tin một nhân viên
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Thêm nhân viên mới
const createStaff = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Kiểm tra email đã tồn tại
        const existingStaff = await Staff.findOne({ email: req.body.email });
        if (existingStaff) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        const staff = new Staff(req.body);
        await staff.save();
        
        res.status(201).json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật thông tin nhân viên
const updateStaff = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['firstName', 'lastName', 'email', 'phone'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Thông tin cập nhật không hợp lệ' });
        }

        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }

        // Kiểm tra email đã tồn tại (nếu email được cập nhật)
        if (req.body.email && req.body.email !== staff.email) {
            const existingStaff = await Staff.findOne({ email: req.body.email });
            if (existingStaff) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }
        }

        updates.forEach(update => staff[update] = req.body[update]);
        await staff.save();

        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa nhân viên
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        }
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getStaffs,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff
}; 