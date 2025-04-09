const API_URL = 'http://localhost:5000/api';

// Hàm hiển thị thông báo
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Hàm tải danh sách học sinh
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const students = await response.json();
            const tableBody = document.querySelector('table tbody');
            tableBody.innerHTML = ''; // Xóa dữ liệu cũ
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.email}</td>
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${student.phone || ''}</td>
                    <td>${student.studentId || ''}</td>
                    <td>${student.class || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-1 edit-student-btn" data-id="${student._id}">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-id="${student._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const error = await response.json();
            showNotification(error.message || 'Không thể tải danh sách học sinh', 'danger');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        showNotification('Đã xảy ra lỗi khi tải danh sách học sinh', 'danger');
    }
}

// Biến lưu trữ dòng hiện tại đang được chỉnh sửa
let currentEditRow = null;

// Xử lý sự kiện khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Tải danh sách học sinh khi trang được tải
    loadStudents();
    
    // Xử lý sự kiện khi nhấn nút Thêm
    document.getElementById('btnAddStudent').addEventListener('click', async function() {
        // Lấy giá trị từ form
        const email = document.getElementById('inputEmail').value;
        const password = document.getElementById('inputPassword').value;
        const firstName = document.getElementById('inputFirstName').value;
        const lastName = document.getElementById('inputLastName').value;
        const phone = document.getElementById('inputPhone').value;
        const studentId = document.getElementById('inputStudentId').value;
        const className = document.getElementById('inputClass').value;
        
        // Kiểm tra dữ liệu
        if (!email || !password || !firstName || !lastName || !studentId) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'danger');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phone,
                    studentId,
                    class: className
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Thêm học sinh thành công!');
                // Tải lại danh sách học sinh
                loadStudents();
                // Đóng modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
                modal.hide();
                // Reset form
                document.getElementById('addStudentForm').reset();
            } else {
                showNotification(data.message || 'Thêm học sinh thất bại', 'danger');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            showNotification('Đã xảy ra lỗi khi thêm học sinh', 'danger');
        }
    });
    
    // Xử lý sự kiện khi nhấn nút chỉnh sửa
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.edit-student-btn')) {
            const button = e.target.closest('.edit-student-btn');
            const studentId = button.dataset.id;
            currentEditRow = button.closest('tr');
            
            try {
                const response = await fetch(`${API_URL}/students/${studentId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const student = await response.json();
                    // Điền thông tin vào form chỉnh sửa
                    document.getElementById('editEmail').value = student.email;
                    document.getElementById('editLastName').value = student.lastName;
                    document.getElementById('editFirstName').value = student.firstName;
                    document.getElementById('editPhone').value = student.phone || '';
                    document.getElementById('editStudentId').value = student.studentId || '';
                    document.getElementById('editClass').value = student.class || '';
                    
                    // Lưu ID học sinh vào form
                    document.getElementById('editStudentForm').dataset.studentId = studentId;
                    
                    // Hiển thị modal chỉnh sửa
                    const editModal = new bootstrap.Modal(document.getElementById('editStudentModal'));
                    editModal.show();
                } else {
                    const error = await response.json();
                    showNotification(error.message || 'Không thể tải thông tin học sinh', 'danger');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Đã xảy ra lỗi khi tải thông tin học sinh', 'danger');
            }
        }
    });
    
    // Xử lý sự kiện khi nhấn nút Lưu thay đổi
    document.getElementById('btnSaveEdit').addEventListener('click', async function() {
        const form = document.getElementById('editStudentForm');
        const studentId = form.dataset.studentId;
        
        if (!studentId) return;
        
        // Lấy giá trị từ form chỉnh sửa
        const firstName = document.getElementById('editFirstName').value;
        const lastName = document.getElementById('editLastName').value;
        const phone = document.getElementById('editPhone').value;
        const className = document.getElementById('editClass').value;
        
        // Kiểm tra dữ liệu
        if (!firstName || !lastName) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'danger');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    class: className
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Cập nhật thông tin học sinh thành công!');
                // Tải lại danh sách học sinh
                loadStudents();
                // Đóng modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
                editModal.hide();
            } else {
                showNotification(data.message || 'Cập nhật thông tin thất bại', 'danger');
            }
        } catch (error) {
            console.error('Lỗi:', error);
            showNotification('Đã xảy ra lỗi khi cập nhật thông tin', 'danger');
        }
    });
    
    // Xử lý sự kiện khi nhấn nút xóa
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.btn-danger')) {
            const button = e.target.closest('.btn-danger');
            const studentId = button.dataset.id;
            
            if (confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
                try {
                    const response = await fetch(`${API_URL}/students/${studentId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (response.ok) {
                        showNotification('Xóa học sinh thành công!');
                        // Tải lại danh sách học sinh
                        loadStudents();
                    } else {
                        const error = await response.json();
                        showNotification(error.message || 'Xóa học sinh thất bại', 'danger');
                    }
                } catch (error) {
                    console.error('Lỗi:', error);
                    showNotification('Đã xảy ra lỗi khi xóa học sinh', 'danger');
                }
            }
        }
    });
});
