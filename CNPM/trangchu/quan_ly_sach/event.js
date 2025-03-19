// Biến lưu trữ dòng hiện tại đang được chỉnh sửa
let currentEditRow = null;
// Biến lưu trữ đường dẫn ảnh bìa hiện tại
let currentCoverPath = "book-cover-default.jpg";

document.addEventListener('DOMContentLoaded', function() {
    // Xử lý sự kiện khi nhấn nút Thêm sách
    document.getElementById('btnAddBook').addEventListener('click', function() {
        // Lấy giá trị từ form
        const title = document.getElementById('inputTitle').value;
        const author = document.getElementById('inputAuthor').value;
        const category = document.getElementById('inputCategory').value;
        const quantity = document.getElementById('inputQuantity').value;
        const coverInput = document.getElementById('inputCover');
        
        // Đường dẫn ảnh bìa (sử dụng giá trị mặc định nếu không chọn file)
        let coverPath = coverInput.files.length > 0 ? 
            URL.createObjectURL(coverInput.files[0]) : 
            "book-cover-default.jpg";
        
        // Kiểm tra dữ liệu
        if (!title || !author || !category || !quantity) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Tạo dòng mới cho bảng
        const tableBody = document.querySelector('table tbody');
        const newRow = document.createElement('tr');
        
        // ID tự động tăng (lấy ID cuối cùng trong bảng + 1)
        let lastId = 0;
        const rows = tableBody.querySelectorAll('tr');
        if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            lastId = parseInt(lastRow.cells[0].textContent);
        }
        
        // Thêm nội dung cho dòng mới
        newRow.innerHTML = `
            <td>${lastId + 1}</td>
            <td>${title}</td>
            <td>${author}</td>
            <td>${category}</td>
            <td>${quantity}</td>
            <td>
                <img src="${coverPath}" alt="Book cover" class="book-cover">
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-1 edit-book-btn">
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
        var modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addBookForm').reset();
    });
    
    // Xử lý sự kiện khi nhấn nút chỉnh sửa (bút màu vàng)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-book-btn')) {
            // Lấy dòng chứa nút được nhấn
            const row = e.target.closest('tr');
            currentEditRow = row;
            
            // Lấy thông tin sách từ dòng hiện tại
            const cells = row.querySelectorAll('td');
            const title = cells[1].textContent;
            const author = cells[2].textContent;
            const category = cells[3].textContent;
            const quantity = cells[4].textContent;
            const coverImg = cells[5].querySelector('img');
            currentCoverPath = coverImg.src;
            
            // Điền thông tin vào form chỉnh sửa
            document.getElementById('editTitle').value = title;
            document.getElementById('editAuthor').value = author;
            document.getElementById('editCategory').value = category;
            document.getElementById('editQuantity').value = quantity;
            document.getElementById('currentCoverPreview').src = currentCoverPath;
            
            // Hiển thị modal chỉnh sửa
            const editModal = new bootstrap.Modal(document.getElementById('editBookModal'));
            editModal.show();
        }
    });
    
    // Xử lý sự kiện khi thay đổi file ảnh bìa trong form chỉnh sửa
    document.getElementById('editCover').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('currentCoverPreview').src = e.target.result;
                currentCoverPath = e.target.result;
            }
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Xử lý sự kiện khi nhấn nút Lưu thay đổi
    document.getElementById('btnSaveEdit').addEventListener('click', function() {
        if (!currentEditRow) return;
        
        // Lấy giá trị từ form chỉnh sửa
        const title = document.getElementById('editTitle').value;
        const author = document.getElementById('editAuthor').value;
        const category = document.getElementById('editCategory').value;
        const quantity = document.getElementById('editQuantity').value;
        
        // Kiểm tra dữ liệu
        if (!title || !author || !category || !quantity) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        
        // Cập nhật thông tin trong dòng hiện tại
        const cells = currentEditRow.querySelectorAll('td');
        cells[1].textContent = title;
        cells[2].textContent = author;
        cells[3].textContent = category;
        cells[4].textContent = quantity;
        cells[5].querySelector('img').src = currentCoverPath;
        
        // Đóng modal
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
        editModal.hide();
        
        // Reset biến lưu trữ dòng hiện tại
        currentEditRow = null;
    });
    
    // Thêm chức năng xóa sách khi nhấn nút xóa
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-danger')) {
            if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
                const row = e.target.closest('tr');
                row.remove();
            }
        }
    });
});
