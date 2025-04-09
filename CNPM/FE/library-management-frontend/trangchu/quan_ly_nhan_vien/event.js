const API_URL = 'http://localhost:5000/api';

// Hàm hiển thị thông báo
function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `alert ${isSuccess ? 'alert-success' : 'alert-danger'} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Hàm lấy token từ localStorage
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Hàm tải danh sách nhân viên
async function loadStaffs() {
    try {
        const response = await fetch(`${API_URL}/staffs`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Không thể tải danh sách nhân viên');
        const data = await response.json();
        
        const tableBody = document.querySelector('table tbody');
        tableBody.innerHTML = '';
        
        data.forEach(staff => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${staff.email}</td>
                <td>${staff.lastName}</td>
                <td>${staff.firstName}</td>
                <td>${staff.phone || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1 edit-staff-btn" data-id="${staff._id}">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-staff-btn" data-id="${staff._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        showNotification(error.message, false);
    }
}

// Biến lưu trữ dòng hiện tại đang được chỉnh sửa
let currentEditRow = null;
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Tải danh sách nhân viên khi trang được mở
    loadStaffs();

    // Xử lý sự kiện khi nhấn nút Thêm
    document.getElementById('btnAddStaff').addEventListener('click', async function() {
        try {
            // Lấy giá trị từ form
            const email = document.getElementById('inputEmail').value.trim();
            const firstName = document.getElementById('inputFirstName').value.trim();
            const lastName = document.getElementById('inputLastName').value.trim();
            const phone = document.getElementById('inputPhone').value.trim();
            const password = document.getElementById('inputPassword').value;
            
            // Kiểm tra dữ liệu
            if (!email || !firstName || !lastName || !phone || !password) {
                throw new Error('Vui lòng điền đầy đủ thông tin!');
            }

            // Gửi request tạo nhân viên mới
            const response = await fetch(`${API_URL}/staffs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    phone,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể thêm nhân viên');
            }

            showNotification('Thêm nhân viên thành công');
            
            // Đóng modal và reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addStaffModal'));
            modal.hide();
            document.getElementById('addStaffForm').reset();
            
            // Tải lại danh sách nhân viên
            await loadStaffs();
        } catch (error) {
            showNotification(error.message, false);
        }
    });
    
    // Xử lý sự kiện khi nhấn nút chỉnh sửa
    document.addEventListener('click', async function(e) {
        const editBtn = e.target.closest('.edit-staff-btn');
        if (editBtn) {
            try {
                const staffId = editBtn.dataset.id;
                currentEditId = staffId;
                
                // Lấy thông tin nhân viên từ API
                const response = await fetch(`${API_URL}/staffs/${staffId}`, {
                    headers: getAuthHeaders()
                });
                
                if (!response.ok) throw new Error('Không thể lấy thông tin nhân viên');
                const staff = await response.json();
                
                // Điền thông tin vào form chỉnh sửa
                document.getElementById('editEmail').value = staff.email;
                document.getElementById('editLastName').value = staff.lastName;
                document.getElementById('editFirstName').value = staff.firstName;
                document.getElementById('editPhone').value = staff.phone || '';
                
                // Hiển thị modal chỉnh sửa
                const editModal = new bootstrap.Modal(document.getElementById('editStaffModal'));
                editModal.show();
            } catch (error) {
                showNotification(error.message, false);
            }
        }
    });
    
    // Xử lý sự kiện khi nhấn nút Lưu thay đổi
    document.getElementById('btnSaveEdit').addEventListener('click', async function() {
        if (!currentEditId) return;
        
        try {
            // Lấy giá trị từ form chỉnh sửa
            const email = document.getElementById('editEmail').value.trim();
            const lastName = document.getElementById('editLastName').value.trim();
            const firstName = document.getElementById('editFirstName').value.trim();
            const phone = document.getElementById('editPhone').value.trim();
            
            // Kiểm tra dữ liệu
            if (!email || !firstName || !lastName || !phone) {
                throw new Error('Vui lòng điền đầy đủ thông tin!');
            }
            
            // Gửi request cập nhật thông tin
            const response = await fetch(`${API_URL}/staffs/${currentEditId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    phone
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật thông tin nhân viên');
            }

            showNotification('Cập nhật thông tin thành công');
            
            // Đóng modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editStaffModal'));
            editModal.hide();
            
            // Tải lại danh sách nhân viên
            await loadStaffs();
            
            // Reset biến lưu trữ
            currentEditId = null;
        } catch (error) {
            showNotification(error.message, false);
        }
    });
    
    // Xử lý sự kiện khi nhấn nút xóa
    document.addEventListener('click', async function(e) {
        const deleteBtn = e.target.closest('.delete-staff-btn');
        if (deleteBtn) {
            if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
                try {
                    const staffId = deleteBtn.dataset.id;
                    
                    const response = await fetch(`${API_URL}/staffs/${staffId}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Không thể xóa nhân viên');
                    }

                    showNotification('Xóa nhân viên thành công');
                    
                    // Tải lại danh sách nhân viên
                    await loadStaffs();
                } catch (error) {
                    showNotification(error.message, false);
                }
            }
        }
    });
});
