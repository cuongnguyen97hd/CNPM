// Dữ liệu mẫu học sinh
const studentsData = [
    { id: 1, email: 'student1@gmail.com', lastName: 'Nguyễn Văn', firstName: 'A' },
    { id: 2, email: 'student2@gmail.com', lastName: 'Trần Thị', firstName: 'B' },
    { id: 3, email: 'student3@gmail.com', lastName: 'Lê Văn', firstName: 'C' },
    { id: 4, email: 'student4@gmail.com', lastName: 'Phạm Thị', firstName: 'D' },
    { id: 5, email: 'student5@gmail.com', lastName: 'Hoàng Văn', firstName: 'E' }
];

// Dữ liệu mẫu sách
const booksData = [
    { id: 1, title: 'Lập trình C++', author: 'Bjarne Stroustrup', category: 'Lập trình', quantity: 5, available: 3 },
    { id: 2, title: 'Java Core', author: 'Cay Horstmann', category: 'Lập trình', quantity: 3, available: 1 },
    { id: 3, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', category: 'Kỹ năng sống', quantity: 10, available: 7 },
    { id: 4, title: 'Toán cao cấp', author: 'GS. Nguyễn Đình Trí', category: 'Toán học', quantity: 8, available: 4 },
    { id: 5, title: 'Vật lý đại cương', author: 'Young & Freedman', category: 'Vật lý', quantity: 6, available: 2 }
];

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
        noResultMessage.style.display = 'block';
    } else {
        noResultMessage.style.display = 'none';
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.email}</td>
                <td>${student.lastName}</td>
                <td>${student.firstName}</td>
                <td>
                    <button class="btn btn-sm btn-primary select-student" data-id="${student.id}">
                        <i class="fas fa-check me-1"></i>Chọn
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Hàm tìm kiếm sách theo tiêu đề
function searchBooks(keyword) {
    keyword = keyword ? keyword.toLowerCase() : '';
    if (!keyword) {
        return booksData;
    }
    return booksData.filter(book => 
        book.title.toLowerCase().includes(keyword) || 
        book.author.toLowerCase().includes(keyword) || 
        book.category.toLowerCase().includes(keyword)
    );
}

// Hàm hiển thị danh sách sách
function renderBooks(books) {
    const tableBody = document.getElementById('booksTableBody');
    const noBookResultMessage = document.getElementById('noBookResultMessage');
    
    tableBody.innerHTML = '';
    
    if (books.length === 0) {
        noBookResultMessage.style.display = 'block';
    } else {
        noBookResultMessage.style.display = 'none';
        
        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.available}/${book.quantity}</td>
                <td>
                    <button class="btn btn-sm btn-primary select-book" data-id="${book.id}" ${book.available === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check me-1"></i>Chọn
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
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
            const student = studentsData.find(s => s.id === studentId);
            
            if (student) {
                document.getElementById('selectedStudentInfo').innerHTML = `
                    <strong>ID:</strong> ${student.id}<br>
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
            const bookId = parseInt(button.dataset.id);
            const book = booksData.find(b => b.id === bookId);
            
            if (book && book.available > 0) {
                // Kiểm tra xem sách đã được thêm vào danh sách chưa
                const existingBookRow = document.querySelector(`#selectedBooksTableBody tr[data-id="${bookId}"]`);
                if (existingBookRow) {
                    alert('Sách này đã được thêm vào danh sách mượn!');
                    return;
                }
                
                const selectedBooksTableBody = document.getElementById('selectedBooksTableBody');
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-id', bookId);
                
                newRow.innerHTML = `
                    <td>${book.id}</td>
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
                
                // Giảm số lượng sách có sẵn
                book.available--;
                
                // Cập nhật lại danh sách sách
                renderBooks(searchBooks(document.getElementById('bookSearchInput').value.trim()));
            }
        }
    });
    
    // Xử lý sự kiện khi xóa sách khỏi danh sách đã chọn
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-book')) {
            const row = e.target.closest('tr');
            const bookId = parseInt(row.dataset.id);
            const book = booksData.find(b => b.id === bookId);
            
            if (book) {
                // Tăng số lượng sách có sẵn
                book.available++;
                
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
        }
    });
    
    // Xử lý sự kiện khi nhấn nút Quay lại
    document.getElementById('backToStudentBtn').addEventListener('click', function() {
        document.getElementById('studentSection').classList.remove('d-none');
        document.getElementById('bookSection').classList.add('d-none');
    });
    
    // Xử lý sự kiện khi nhấn nút Đổi học sinh
    document.getElementById('changeStudentBtn').addEventListener('click', function() {
        document.getElementById('studentSection').classList.remove('d-none');
        document.getElementById('bookSection').classList.add('d-none');
        document.getElementById('selectedStudentSection').classList.add('d-none');
    });
    
    // Xử lý sự kiện khi nhấn nút Tạo phiếu mượn
    document.getElementById('createLoanBtn').addEventListener('click', function() {
        // Kiểm tra xem có học sinh và sách nào được chọn không
        if (document.getElementById('selectedStudentInfo').innerHTML.trim() === '') {
            alert('Vui lòng chọn học sinh!');
            return;
        }
        
        if (document.getElementById('selectedBooksTableBody').children.length === 0) {
            alert('Vui lòng chọn ít nhất một cuốn sách!');
            return;
        }
        
        // Lấy thông tin ngày mượn và ngày trả
        const borrowDate = document.getElementById('borrowDate').value;
        const returnDate = document.getElementById('returnDate').value;
        
        if (!borrowDate || !returnDate) {
            alert('Vui lòng chọn ngày mượn và ngày trả!');
            return;
        }
        
        // Kiểm tra ngày trả phải sau ngày mượn
        if (new Date(returnDate) <= new Date(borrowDate)) {
            alert('Ngày trả phải sau ngày mượn!');
            return;
        }
        
        // Tạo phiếu mượn thành công
        alert('Tạo phiếu mượn thành công!');
        
        // Reset form
        document.getElementById('selectedStudentInfo').innerHTML = '';
        document.getElementById('selectedBooksTableBody').innerHTML = '';
        document.getElementById('borrowDate').value = '';
        document.getElementById('returnDate').value = '';
        
        document.getElementById('studentSection').classList.remove('d-none');
        document.getElementById('bookSection').classList.add('d-none');
        document.getElementById('selectedStudentSection').classList.add('d-none');
        document.getElementById('selectedBooksSection').classList.add('d-none');
        document.getElementById('submitSection').classList.add('d-none');
        
        // Reset lại số lượng sách có sẵn
        booksData.forEach(book => {
            book.available = book.quantity - Math.floor(Math.random() * 3); // Random số lượng sách đã mượn
        });
        
        // Cập nhật lại danh sách sách
        renderBooks(booksData);
    });
});
