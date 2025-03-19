// Biến lưu trữ dòng hiện tại đang được chỉnh sửa
let currentEditRow = null;

document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện khi nhấn nút Thêm
    document.getElementById('btnAddStaff').addEventListener('click', function() {
        // Lấy giá trị từ form
        const email = document.getElementById('inputEmail').value;
        const firstName = document.getElementById('inputFirstName').value;
        const lastName = document.getElementById('inputLastName').value;
        const phone = document.getElementById('inputPhone').value;
        
        // Kiểm tra dữ liệu
        if (!email || !firstName || !lastName || !phone) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Tạo dòng mới cho bảng
        const tableBody = document.querySelector('table tbody');
        const newRow = document.createElement('tr');
        
        // Thêm nội dung cho dòng mới
        newRow.innerHTML = `
            <td>${email}</td>
            <td>${lastName}</td>
            <td>${firstName}</td>
            <td>${phone}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1 edit-staff-btn">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="btn btn-sm btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Thêm dòng mới vào cuối bảng
        tableBody.appendChild(newRow);
        
        // Đóng modal
        var modal = bootstrap.Modal.getInstance(document.getElementById('addStaffModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addStaffForm').reset();
    });
    
    // Xử lý sự kiện khi nhấn nút chỉnh sửa (bút màu vàng)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-staff-btn')) {
            // Lấy dòng chứa nút được nhấn
            const row = e.target.closest('tr');
            currentEditRow = row;
            
            // Lấy thông tin nhân viên từ dòng hiện tại
            const cells = row.querySelectorAll('td');
            const email = cells[0].textContent;
            const lastName = cells[1].textContent;
            const firstName = cells[2].textContent;
            const phone = cells[3].textContent;
            
            // Điền thông tin vào form chỉnh sửa
            document.getElementById('editEmail').value = email;
            document.getElementById('editLastName').value = lastName;
            document.getElementById('editFirstName').value = firstName;
            document.getElementById('editPhone').value = phone;
            
            // Hiển thị modal chỉnh sửa
            const editModal = new bootstrap.Modal(document.getElementById('editStaffModal'));
            editModal.show();
        }
    });
    
    // Xử lý sự kiện khi nhấn nút Lưu thay đổi
    document.getElementById('btnSaveEdit').addEventListener('click', function() {
        if (!currentEditRow) return;
        
        // Lấy giá trị từ form chỉnh sửa
        const email = document.getElementById('editEmail').value;
        const lastName = document.getElementById('editLastName').value;
        const firstName = document.getElementById('editFirstName').value;
        const phone = document.getElementById('editPhone').value;
        
        // Kiểm tra dữ liệu
        if (!email || !firstName || !lastName || !phone) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Cập nhật thông tin trong dòng hiện tại
        const cells = currentEditRow.querySelectorAll('td');
        cells[0].textContent = email;
        cells[1].textContent = lastName;
        cells[2].textContent = firstName;
        cells[3].textContent = phone;
        
        // Đóng modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editStaffModal'));
        editModal.hide();
        
        // Reset biến lưu trữ dòng hiện tại
        currentEditRow = null;
    });
    
    // Thêm chức năng xóa nhân viên khi nhấn nút xóa
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-danger')) {
            if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
                const row = e.target.closest('tr');
                row.remove();
            }
        }
    });
});
