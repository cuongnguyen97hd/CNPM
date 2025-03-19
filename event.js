/**
 * Xác thực đăng nhập và chuyển hướng đến trang chủ
 * @param {Event} event - Sự kiện form submit
 */
function validateAndRedirect(event) {
    event.preventDefault();
    
    // Có thể thêm xác thực đăng nhập ở đây nếu cần
    // Ví dụ: kiểm tra tên đăng nhập và mật khẩu
    
    // Chuyển hướng sang trang chủ
    window.location.href = "../trangchu/index.html";
}
