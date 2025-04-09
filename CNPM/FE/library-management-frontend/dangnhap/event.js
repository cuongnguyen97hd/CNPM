const API_URL = 'http://localhost:5000/api';

/**
 * Hiển thị thông báo
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo (success/error)
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const notificationIcon = document.getElementById('notification-icon');
    
    // Xóa class cũ
    notification.classList.remove('success', 'error');
    
    // Thêm class mới
    notification.classList.add(type);
    
    // Cập nhật nội dung
    notificationMessage.textContent = message;
    notificationIcon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
    
    // Hiển thị thông báo
    notification.style.display = 'block';
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

/**
 * Hiển thị/ẩn mật khẩu đăng nhập
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

/**
 * Hiển thị/ẩn mật khẩu đăng ký
 */
function toggleRegisterPasswordVisibility() {
    const passwordInput = document.getElementById('reg-password');
    const toggleIcon = document.getElementById('toggleRegisterPassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

/**
 * Hiển thị/ẩn mật khẩu xác nhận
 */
function toggleConfirmPasswordVisibility() {
    const passwordInput = document.getElementById('reg-confirm-password');
    const toggleIcon = document.getElementById('toggleConfirmPassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

/**
 * Hiển thị form đăng ký
 */
function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

/**
 * Hiển thị form đăng nhập
 */
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

/**
 * Kiểm tra độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {boolean} - true nếu mật khẩu hợp lệ
 */
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
}

/**
 * Xác thực đăng nhập và chuyển hướng đến trang chủ
 * @param {Event} event - Sự kiện form submit
 */
async function validateAndRedirect(event) {
    event.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Lưu token vào localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Chuyển hướng sang trang chủ
            window.location.href = "../trangchu/index.html";
        } else {
            alert(data.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Đã xảy ra lỗi khi đăng nhập');
    }
}

/**
 * Xử lý đăng ký người dùng mới
 * @param {Event} event - Sự kiện form submit
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }

    // Kiểm tra độ mạnh của mật khẩu
    if (!validatePassword(password)) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự và chứa cả chữ và số', 'error');
        return;
    }

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !firstName || !lastName) {
        showNotification('Vui lòng điền đầy đủ thông tin', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                role: 'student' // Mặc định là học sinh
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Hiển thị thông báo thành công
            showNotification('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', 'success');
            
            // Xóa dữ liệu trong form đăng ký
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('reg-confirm-password').value = '';
            document.getElementById('reg-firstname').value = '';
            document.getElementById('reg-lastname').value = '';
            
            // Chuyển về form đăng nhập sau 2 giây
            setTimeout(() => {
                showLoginForm();
            }, 2000);
        } else {
            // Hiển thị thông báo lỗi từ server
            showNotification(data.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        if (error.message === 'Failed to fetch') {
            showNotification('Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.', 'error');
        } else {
            showNotification('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.', 'error');
        }
    }
}

// Thêm event listeners khi DOM đã được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', validateAndRedirect);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});
