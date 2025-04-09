// Dữ liệu mẫu học sinh
const studentsData = [];

// Dữ liệu mẫu sách
const booksData = [];

const API_URL = 'http://localhost:5000/api';

// Hàm load danh sách học sinh từ API
async function loadStudents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách học sinh');
        }
        
        const data = await response.json();
        studentsData.length = 0; // Xóa mảng cũ
        studentsData.push(...data); // Thêm dữ liệu mới
        renderStudents(studentsData); // Hiển thị danh sách học sinh
    } catch (error) {
        console.error('Lỗi khi tải danh sách học sinh:', error);
        alert('Không thể tải danh sách học sinh. Vui lòng thử lại sau.');
    }
}

// Hàm tìm kiếm học sinh theo email
function searchStudents(keyword) {
    keyword = keyword ? keyword.toLowerCase() : '';
    if (!keyword) {
        return studentsData;
    }
    return studentsData.filter(student => 
        student.email.toLowerCase().includes(keyword)
    );
}

// Hàm hiển thị danh sách học sinh
function renderStudents(students) {
    const tableBody = document.getElementById('studentsTableBody');
    const noResultMessage = document.getElementById('noResultMessage');
    
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        noResultMessage.classList.remove('d-none');
    } else {
        noResultMessage.classList.add('d-none');
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentId}</td>
                <td>${student.email}</td>
                <td>${student.lastName}</td>
                <td>${student.firstName}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm create-loan-btn" 
                            data-student-id="${student.studentId}" 
                            data-student-name="${student.lastName} ${student.firstName}" 
                            data-student-email="${student.email}">
                        Tạo phiếu mượn
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Hàm load danh sách sách từ API
async function loadBooks() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/books`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách sách');
        }
        
        const data = await response.json();
        // Xóa mảng cũ và thêm dữ liệu mới
        booksData.length = 0;
        if (Array.isArray(data)) {
            data.forEach(book => booksData.push(book));
        } else if (data.books && Array.isArray(data.books)) {
            data.books.forEach(book => booksData.push(book));
        }
        renderBooks(booksData); // Hiển thị danh sách sách
    } catch (error) {
        console.error('Lỗi khi tải danh sách sách:', error);
        alert('Không thể tải danh sách sách. Vui lòng thử lại sau.');
    }
}

// Hàm tìm kiếm sách theo tiêu đề, tác giả hoặc thể loại
function searchBooks(keyword) {
    keyword = keyword ? keyword.toLowerCase() : '';
    if (!keyword) {
        return booksData;
    }
    return booksData.filter(book => 
        (book.title && book.title.toLowerCase().includes(keyword)) || 
        (book.author && book.author.toLowerCase().includes(keyword)) || 
        (book.category && book.category.toLowerCase().includes(keyword))
    );
}

// Hàm hiển thị danh sách sách
function renderBooks(books) {
    const tableBody = document.getElementById('booksTableBody');
    const noBookResultMessage = document.getElementById('noBookResultMessage');
    
    tableBody.innerHTML = '';
    
    if (books.length === 0) {
        noBookResultMessage.classList.remove('d-none');
    } else {
        noBookResultMessage.classList.add('d-none');
        
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title || 'N/A'}</td>
                <td>${book.description || 'N/A'}</td>
                <td>${book.category || 'N/A'}</td>
                <td>${book.author || 'N/A'}</td>
                <td>
                    <img src="${book.coverImage || '../default-book-cover.png'}" alt="Ảnh bìa" style="width: 50px; height: 70px; object-fit: cover;">
                </td>
                <td>${book.publishDate ? new Date(book.publishDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>${book.quantity || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary select-book" 
                            data-id="${book._id}" 
                            data-title="${book.title || ''}"
                            data-author="${book.author || ''}"
                            ${(book.quantity <= 0 || isBookBorrowed(book._id)) ? 'disabled' : ''}>
                        <i class="fas fa-check me-1"></i>Chọn
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Hàm kiểm tra xem sách đã được mượn chưa
function isBookBorrowed(bookId) {
    const selectedBooks = document.querySelectorAll('#selectedBooksTableBody tr');
    return Array.from(selectedBooks).some(row => row.dataset.id === bookId);
}

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

document.addEventListener('DOMContentLoaded', function() {
    // Load danh sách học sinh khi trang tải xong
    loadStudents();
    
    // Hiển thị danh sách học sinh và sách khi trang tải xong
    renderStudents(studentsData);
    renderBooks(booksData);
    
    // Xử lý sự kiện khi nhập vào ô tìm kiếm học sinh
    document.getElementById('searchInput').addEventListener('input', function() {
        const keyword = this.value.trim();
        const students = searchStudents(keyword);
        renderStudents(students);
    });
    
    // Xử lý sự kiện khi nhập vào ô tìm kiếm sách
    document.getElementById('bookSearchInput').addEventListener('input', function() {
        const keyword = this.value.trim();
        const books = searchBooks(keyword);
        renderBooks(books);
    });
    
    // Xử lý sự kiện khi nhấn Enter trong ô tìm kiếm học sinh
    document.getElementById('searchInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const keyword = this.value.trim();
            const students = searchStudents(keyword);
            renderStudents(students);
        }
    });
    
    // Xử lý sự kiện khi nhấn Enter trong ô tìm kiếm sách
    document.getElementById('bookSearchInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const keyword = this.value.trim();
            const books = searchBooks(keyword);
            renderBooks(books);
        }
    });
    
    // Xử lý sự kiện khi chọn học sinh
    document.addEventListener('click', function(e) {
        if (e.target.closest('.select-student')) {
            const button = e.target.closest('.select-student');
            const studentId = parseInt(button.dataset.id);
            const student = studentsData.find(s => s.studentId === studentId);
            
            if (student) {
                document.getElementById('selectedStudentInfo').innerHTML = `
                    <strong>ID:</strong> ${student.studentId}<br>
                    <strong>Email:</strong> ${student.email}<br>
                    <strong>Họ và tên:</strong> ${student.lastName} ${student.firstName}
                `;
                document.getElementById('studentSection').classList.add('d-none');
                document.getElementById('bookSection').classList.remove('d-none');
                document.getElementById('selectedStudentSection').classList.remove('d-none');
            }
        }
    });
    
    // Xử lý sự kiện khi chọn sách
    document.addEventListener('click', function(e) {
        if (e.target.closest('.select-book')) {
            const button = e.target.closest('.select-book');
            const bookId = button.dataset.id;
            const book = booksData.find(b => b._id === bookId);
            
            if (book && book.quantity > 0 && !isBookBorrowed(bookId)) {
                const selectedBooksTableBody = document.getElementById('selectedBooksTableBody');
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-id', bookId);
                
                newRow.innerHTML = `
                    <td>${book._id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>
                        <button class="btn btn-sm btn-danger remove-book">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                `;
                
                selectedBooksTableBody.appendChild(newRow);
                document.getElementById('selectedBooksSection').classList.remove('d-none');
                document.getElementById('submitSection').classList.remove('d-none');
                
                // Cập nhật lại danh sách sách
                renderBooks(searchBooks(document.getElementById('bookSearchInput').value.trim()));
            }
        }
    });
    
    // Xử lý sự kiện khi xóa sách khỏi danh sách đã chọn
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-book')) {
            const row = e.target.closest('tr');
            const bookId = row.dataset.id;
            
            // Xóa dòng khỏi bảng
            row.remove();
            
            // Kiểm tra nếu không còn sách nào được chọn
            if (document.getElementById('selectedBooksTableBody').children.length === 0) {
                document.getElementById('selectedBooksSection').classList.add('d-none');
                document.getElementById('submitSection').classList.add('d-none');
            }
            
            // Cập nhật lại danh sách sách
            renderBooks(searchBooks(document.getElementById('bookSearchInput').value.trim()));
        }
    });
    
    // Xử lý sự kiện khi click vào nút tạo phiếu mượn
    document.addEventListener('click', function(e) {
        if (e.target.closest('.create-loan-btn')) {
            const button = e.target.closest('.create-loan-btn');
            const studentId = button.dataset.studentId;
            const studentName = button.dataset.studentName;
            const studentEmail = button.dataset.studentEmail;
            
            // Hiển thị thông tin học sinh đã chọn
            document.getElementById('selectedStudentInfo').innerHTML = `
                <strong>Mã học sinh:</strong> ${studentId}<br>
                <strong>Email:</strong> ${studentEmail}<br>
                <strong>Họ và tên:</strong> ${studentName}
            `;
            
            // Ẩn phần tìm học sinh
            document.getElementById('studentSection').classList.add('d-none');
            
            // Hiển thị phần tìm sách và thông tin học sinh
            document.getElementById('bookSection').classList.remove('d-none');
            document.getElementById('selectedStudentSection').classList.remove('d-none');
            
            // Load danh sách sách
            loadBooks();
        }
    });
    
    // Xử lý sự kiện khi click nút quay lại
    document.getElementById('backToStudentBtn').addEventListener('click', function() {
        // Ẩn phần tìm sách
        document.getElementById('bookSection').classList.add('d-none');
        
        // Hiển thị lại phần tìm học sinh
        document.getElementById('studentSection').classList.remove('d-none');
        
        // Reset các phần đã chọn
        document.getElementById('selectedBooksTableBody').innerHTML = '';
        document.getElementById('selectedBooksSection').classList.add('d-none');
        document.getElementById('submitSection').classList.add('d-none');
    });
    
    // Xử lý sự kiện khi click nút đổi học sinh
    document.getElementById('changeStudentBtn').addEventListener('click', function() {
        // Ẩn phần tìm sách
        document.getElementById('bookSection').classList.add('d-none');
        
        // Hiển thị lại phần tìm học sinh
        document.getElementById('studentSection').classList.remove('d-none');
        
        // Reset các phần đã chọn
        document.getElementById('selectedBooksTableBody').innerHTML = '';
        document.getElementById('selectedBooksSection').classList.add('d-none');
        document.getElementById('submitSection').classList.add('d-none');
    });
    
    // Thiết lập ngày mượn và ngày trả mặc định
    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 14); // Mặc định 14 ngày

    document.getElementById('borrowDate').valueAsDate = today;
    document.getElementById('returnDate').valueAsDate = returnDate;

    // Xử lý sự kiện khi nhấn nút tạo phiếu mượn
    document.getElementById('createLoanBtn').addEventListener('click', async function() {
        try {
            // Lấy thông tin học sinh từ nội dung HTML
            const studentInfo = document.getElementById('selectedStudentInfo').innerHTML;
            const studentIdMatch = studentInfo.match(/ID:\s*(\d+)/);
            if (!studentIdMatch) {
                throw new Error('Không tìm thấy thông tin học sinh');
            }
            const studentId = studentIdMatch[1];

            // Lấy danh sách sách được chọn
            const selectedBooks = Array.from(document.querySelectorAll('#selectedBooksTableBody tr')).map(row => row.dataset.id);

            if (selectedBooks.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một cuốn sách');
            }

            // Lấy ngày mượn và ngày trả
            const borrowDate = document.getElementById('borrowDate').value;
            const returnDate = document.getElementById('returnDate').value;

            if (!borrowDate || !returnDate) {
                throw new Error('Vui lòng chọn ngày mượn và ngày trả');
            }

            // Kiểm tra ngày trả phải sau ngày mượn
            if (new Date(returnDate) <= new Date(borrowDate)) {
                throw new Error('Ngày trả phải sau ngày mượn');
            }

            // Tạo phiếu mượn
            const response = await fetch(`${API_URL}/loans`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    studentId,
                    books: selectedBooks,
                    borrowDate,
                    returnDate
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Không thể tạo phiếu mượn');
            }

            showNotification('Tạo phiếu mượn thành công!');

            // Reset form và quay lại trang tìm học sinh
            document.getElementById('selectedBooksTableBody').innerHTML = '';
            document.getElementById('selectedBooksSection').classList.add('d-none');
            document.getElementById('submitSection').classList.add('d-none');
            document.getElementById('bookSection').classList.add('d-none');
            document.getElementById('studentSection').classList.remove('d-none');
            document.getElementById('selectedStudentSection').classList.add('d-none');

            // Reset ngày mượn và ngày trả về mặc định
            const today = new Date();
            const defaultReturnDate = new Date();
            defaultReturnDate.setDate(today.getDate() + 14);
            document.getElementById('borrowDate').valueAsDate = today;
            document.getElementById('returnDate').valueAsDate = defaultReturnDate;

        } catch (error) {
            showNotification(error.message, false);
        }
    });
});
