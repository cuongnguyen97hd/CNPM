require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function createAdmin() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (existingAdmin) {
            console.log('Tài khoản admin đã tồn tại');
            return;
        }

        // Tạo tài khoản admin mới
        const admin = new User({
            email: 'admin@gmail.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            phone: '0123456789',
            role: 'staff'
        });

        await admin.save();
        console.log('Đã tạo tài khoản admin thành công');

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.disconnect();
    }
}

createAdmin(); 