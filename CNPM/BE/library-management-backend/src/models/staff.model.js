const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Hash mật khẩu trước khi lưu
staffSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Phương thức so sánh mật khẩu
staffSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Không trả về mật khẩu khi chuyển đổi sang JSON
staffSchema.methods.toJSON = function() {
    const staff = this.toObject();
    delete staff.password;
    return staff;
};

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff; 