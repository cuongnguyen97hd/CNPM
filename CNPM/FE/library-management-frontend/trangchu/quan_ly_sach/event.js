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
        'Authorization': `Bearer ${token}`
    };
}

// Hàm validate dữ liệu sách
function validateBookData(formData) {
    const title = formData.get('title');
    const author = formData.get('author');
    const category = formData.get('category');
    const quantity = formData.get('quantity');
    const publishDate = formData.get('publishDate');

    if (!title || title.trim().length === 0) {
        throw new Error('Tiêu đề sách không được để trống');
    }
    if (!author || author.trim().length === 0) {
        throw new Error('Tác giả không được để trống');
    }
    if (!category || category === '0') {
        throw new Error('Vui lòng chọn thể loại sách');
    }
    if (!quantity || parseInt(quantity) < 0) {
        throw new Error('Số lượng sách phải lớn hơn hoặc bằng 0');
    }
    if (!publishDate) {
        throw new Error('Ngày xuất bản không được để trống');
    }
    const publishDateObj = new Date(publishDate);
    if (publishDateObj > new Date()) {
        throw new Error('Ngày xuất bản không thể là ngày trong tương lai');
    }
}

// Hàm tải danh sách sách
async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Không thể tải danh sách sách');
        const data = await response.json();
        
        const tableBody = document.querySelector('table tbody');
        tableBody.innerHTML = '';
        
        data.books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title || 'N/A'}</td>
                <td>${book.description || 'N/A'}</td>
                <td>${book.category || 'N/A'}</td>
                <td>${book.author || 'N/A'}</td>
                <td>
                    <img src="${book.coverImage || '../default-book-cover.png'}" 
                         alt="Ảnh bìa" 
                         style="width: 50px; height: 70px; object-fit: cover;">
            </td>
                <td>${book.publishDate ? new Date(book.publishDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>${book.quantity || 0}</td>
            <td>
                    <button class="btn btn-primary btn-sm edit-book" data-id="${book._id}">
                        <i class="fas fa-edit"></i>
                </button>
                    <button class="btn btn-danger btn-sm delete-book" data-id="${book._id}">
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

// Xử lý thêm sách mới
document.getElementById('btnAddBook').addEventListener('click', async () => {
    try {
        const formData = new FormData();
        formData.append('title', document.getElementById('inputTitle').value.trim());
        formData.append('author', document.getElementById('inputAuthor').value.trim());
        formData.append('publishDate', document.getElementById('inputDate').value);
        formData.append('quantity', document.getElementById('inputQuantity').value);
        formData.append('category', document.getElementById('inputCategory').value);
        formData.append('description', document.getElementById('inputDescription').value.trim());

        const coverFile = document.getElementById('inputCover').files[0];
        if (coverFile) {
            if (coverFile.size > 5 * 1024 * 1024) {
                throw new Error('Kích thước ảnh không được vượt quá 5MB');
            }
            formData.append('coverImage', coverFile);
        }

        // Validate dữ liệu trước khi gửi
        validateBookData(formData);

        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể thêm sách');
        }

        showNotification('Thêm sách thành công');
        document.getElementById('addBookForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
        await loadBooks();
    } catch (error) {
        showNotification(error.message, false);
    }
});

// Tải danh sách sách khi trang được mở
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    
    // Thêm xử lý sự kiện cho nút chỉnh sửa và xóa
    document.addEventListener('click', async (e) => {
        // Xử lý nút chỉnh sửa
        if (e.target.closest('.edit-book')) {
            const button = e.target.closest('.edit-book');
            const bookId = button.dataset.id;
            await editBook(bookId);
        }
        
        // Xử lý nút xóa
        if (e.target.closest('.delete-book')) {
            const button = e.target.closest('.delete-book');
            const bookId = button.dataset.id;
            await deleteBook(bookId);
        }
    });
});

// Hàm lấy thông tin sách để chỉnh sửa
async function editBook(bookId) {
    try {
        const response = await fetch(`${API_URL}/books/${bookId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Không thể lấy thông tin sách');
        const book = await response.json();

        // Điền thông tin vào form
        document.getElementById('editTitle').value = book.title || '';
        document.getElementById('editAuthor').value = book.author || '';
        document.getElementById('editDate').value = book.publishDate ? book.publishDate.split('T')[0] : '';
        document.getElementById('editQuantity').value = book.quantity || 0;
        document.getElementById('editCategory').value = book.category || '';
        document.getElementById('editDescription').value = book.description || '';

        // Hiển thị ảnh bìa hiện tại nếu có
        const preview = document.getElementById('currentCoverPreview');
        if (book.coverImage) {
            preview.src = book.coverImage.startsWith('http') ? book.coverImage : `${API_URL}${book.coverImage}`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }

        // Lưu bookId vào button Save để sử dụng khi lưu
        const saveButton = document.getElementById('btnSaveEdit');
        saveButton.dataset.bookId = bookId;

        // Hiển thị modal
        const editModal = new bootstrap.Modal(document.getElementById('editBookModal'));
        editModal.show();
    } catch (error) {
        showNotification(error.message, false);
    }
}

// Xử lý sự kiện khi nhấn nút Lưu trong modal chỉnh sửa
document.getElementById('btnSaveEdit').addEventListener('click', async function() {
    const bookId = this.dataset.bookId;
    if (!bookId) {
        showNotification('Không tìm thấy ID sách', false);
        return;
    }
    await saveBookChanges(bookId);
});

// Hàm lưu thay đổi sách
async function saveBookChanges(bookId) {
    try {
        const formData = new FormData();
        formData.append('title', document.getElementById('editTitle').value.trim());
        formData.append('author', document.getElementById('editAuthor').value.trim());
        formData.append('publishDate', document.getElementById('editDate').value);
        formData.append('quantity', document.getElementById('editQuantity').value);
        formData.append('category', document.getElementById('editCategory').value);
        formData.append('description', document.getElementById('editDescription').value.trim());

        const coverFile = document.getElementById('editCover').files[0];
        if (coverFile) {
            if (coverFile.size > 5 * 1024 * 1024) {
                throw new Error('Kích thước ảnh không được vượt quá 5MB');
            }
            formData.append('coverImage', coverFile);
        }

        // Validate dữ liệu trước khi gửi
        validateBookData(formData);

        const response = await fetch(`${API_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể cập nhật sách');
        }

        showNotification('Cập nhật sách thành công');
        bootstrap.Modal.getInstance(document.getElementById('editBookModal')).hide();
        await loadBooks();
    } catch (error) {
        showNotification(error.message, false);
    }
}

// Hàm xóa sách
async function deleteBook(bookId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này?')) return;

    try {
        const response = await fetch(`${API_URL}/books/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Không thể xóa sách');
        }

        showNotification('Xóa sách thành công');
        await loadBooks();
    } catch (error) {
        showNotification(error.message, false);
    }
}
