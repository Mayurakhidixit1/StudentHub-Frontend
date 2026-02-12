// DOM Elements
const studentForm = document.getElementById('studentForm');
const studentsTableBody = document.getElementById('studentsTableBody');
const emptyState = document.getElementById('emptyState');
const formTitle = document.getElementById('formTitle');
const formMode = document.getElementById('formMode');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const clearBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput');
const filterCourse = document.getElementById('filterCourse');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const recordCount = document.getElementById('recordCount');

// Statistics elements
const totalStudentsEl = document.getElementById('totalStudents');
const maleStudentsEl = document.getElementById('maleStudents');
const femaleStudentsEl = document.getElementById('femaleStudents');
const averageAgeEl = document.getElementById('averageAge');

// Error message elements
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const ageError = document.getElementById('ageError');

// Student data (loaded from localStorage)
let students = JSON.parse(localStorage.getItem('students')) || [];
let editStudentId = null;

// Initialize the application
function init() {
    renderStudents();
    updateStats();
    
    // Form submit event
    studentForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel edit event
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Clear form event
    clearBtn.addEventListener('click', clearForm);
    
    // Search and filter events
    searchInput.addEventListener('input', renderStudents);
    filterCourse.addEventListener('change', renderStudents);
    
    // Phone number validation
    document.getElementById('phone').addEventListener('input', validatePhone);
    
    // Real-time validation
    document.getElementById('fullName').addEventListener('blur', validateName);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('age').addEventListener('blur', validateAge);
    
    // Add sample data if empty
    if (students.length === 0) {
        addSampleData();
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
        return;
    }
    
    // Get form values
    const studentData = {
        id: editStudentId || Date.now().toString(),
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phone: document.getElementById('phone').value.trim(),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        course: document.getElementById('course').value,
        address: document.getElementById('address').value.trim()
    };
    
    // Check if email already exists (for new students only)
    if (!editStudentId && students.some(s => s.email === studentData.email)) {
        showError(emailError, 'A student with this email already exists');
        return;
    }
    
    if (editStudentId) {
        // Update existing student
        const index = students.findIndex(s => s.id === editStudentId);
        if (index !== -1) {
            students[index] = studentData;
            showToast('Student updated successfully', 'success');
        }
    } else {
        // Add new student
        students.push(studentData);
        showToast('Student added successfully', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('students', JSON.stringify(students));
    
    // Reset form and update UI
    clearForm();
    renderStudents();
    updateStats();
}

// Validate the entire form
function validateForm() {
    let isValid = true;
    
    // Validate name
    if (!validateName()) isValid = false;
    
    // Validate email
    if (!validateEmail()) isValid = false;
    
    // Validate phone
    if (!validatePhone()) isValid = false;
    
    // Validate age
    if (!validateAge()) isValid = false;
    
    // Validate required fields
    const gender = document.getElementById('gender').value;
    const course = document.getElementById('course').value;
    
    if (!gender) {
        showToast('Please select a gender', 'warning');
        isValid = false;
    }
    
    if (!course) {
        showToast('Please select a course', 'warning');
        isValid = false;
    }
    
    return isValid;
}

// Validate name
function validateName() {
    const nameInput = document.getElementById('fullName');
    const name = nameInput.value.trim();
    
    if (!name || name.length < 2) {
        showError(nameError, 'Name must be at least 2 characters');
        nameInput.classList.add('error');
        return false;
    }
    
    hideError(nameError);
    nameInput.classList.remove('error');
    return true;
}

// Validate email
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        showError(emailError, 'Please enter a valid email address');
        emailInput.classList.add('error');
        return false;
    }
    
    hideError(emailError);
    emailInput.classList.remove('error');
    return true;
}

// Validate phone number (exactly 10 digits)
function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    const phoneRegex = /^\d{10}$/;
    
    // Only validate if there's input
    if (phone && !phoneRegex.test(phone)) {
        showError(phoneError, 'Phone number must be exactly 10 digits');
        phoneInput.classList.add('error');
        return false;
    }
    
    hideError(phoneError);
    phoneInput.classList.remove('error');
    return true;
}

// Validate age
function validateAge() {
    const ageInput = document.getElementById('age');
    const age = parseInt(ageInput.value);
    
    if (isNaN(age) || age < 16 || age > 40) {
        showError(ageError, 'Age must be between 16 and 40');
        ageInput.classList.add('error');
        return false;
    }
    
    hideError(ageError);
    ageInput.classList.remove('error');
    return true;
}

// Show error message
function showError(errorElement, message) {
    errorElement.querySelector('span').textContent = message;
    errorElement.classList.add('show');
}

// Hide error message
function hideError(errorElement) {
    errorElement.classList.remove('show');
}

// Render students table
function renderStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterCourse.value;
    
    // Filter students
    let filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.fullName.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.course.toLowerCase().includes(searchTerm);
        
        const matchesFilter = !filterValue || student.course === filterValue;
        
        return matchesSearch && matchesFilter;
    });
    
    // Update record count
    recordCount.textContent = filteredStudents.length;
    
    // Clear table
    studentsTableBody.innerHTML = '';
    
    // Show/hide empty state
    if (filteredStudents.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        // Add student rows to table
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            
            // Get initials for avatar
            const initials = getInitials(student.fullName);
            
            // Get gender class
            const genderClass = `gender-${student.gender.toLowerCase()}`;
            
            row.innerHTML = `
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div class="student-name">${student.fullName}</div>
                            <div class="student-email">${student.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="course-badge">${student.course}</span>
                </td>
                <td><strong>${student.age}</strong></td>
                <td>
                    <span class="gender-badge ${genderClass}">${student.gender}</span>
                </td>
                <td>${formatPhoneNumber(student.phone)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-secondary" onclick="editStudent('${student.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-danger" onclick="deleteStudent('${student.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            studentsTableBody.appendChild(row);
        });
    }
}

// Get initials from name
function getInitials(name) {
    return name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Format phone number
function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Format as XXX-XXX-XXXX
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

// Edit student
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    // Fill form with student data
    document.getElementById('studentId').value = student.id;
    document.getElementById('fullName').value = student.fullName;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('age').value = student.age;
    document.getElementById('gender').value = student.gender;
    document.getElementById('course').value = student.course;
    document.getElementById('address').value = student.address;
    
    // Update UI for edit mode
    editStudentId = id;
    formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit Student';
    formMode.innerHTML = '<span class="course-badge">Editing Mode</span>';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
    submitBtn.className = 'btn btn-success';
    cancelBtn.style.display = 'flex';
    
    // Clear any existing errors
    clearErrors();
    
    // Scroll to form
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        renderStudents();
        updateStats();
        showToast('Student deleted successfully', 'success');
        
        // If we were editing this student, cancel edit
        if (editStudentId === id) {
            cancelEdit();
        }
    }
}

// Cancel edit mode
function cancelEdit() {
    editStudentId = null;
    clearForm();
    formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New Student';
    formMode.innerHTML = '';
    submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Student';
    submitBtn.className = 'btn btn-primary';
    cancelBtn.style.display = 'none';
}

// Clear form
function clearForm() {
    studentForm.reset();
    document.getElementById('studentId').value = '';
    clearErrors();
}

// Clear all error messages
function clearErrors() {
    [nameError, emailError, phoneError, ageError].forEach(error => hideError(error));
    
    // Remove error classes
    document.querySelectorAll('.form-control.error').forEach(el => {
        el.classList.remove('error');
    });
}

// Update statistics
function updateStats() {
    const total = students.length;
    const maleCount = students.filter(s => s.gender === 'Male').length;
    const femaleCount = students.filter(s => s.gender === 'Female').length;
    
    // Calculate average age
    const totalAge = students.reduce((sum, student) => sum + student.age, 0);
    const averageAge = total > 0 ? (totalAge / total).toFixed(1) : 0;
    
    // Update UI
    totalStudentsEl.textContent = total;
    maleStudentsEl.textContent = maleCount;
    femaleStudentsEl.textContent = femaleCount;
    averageAgeEl.textContent = averageAge;
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    // Update icon based on type
    const icon = toast.querySelector('.toast-icon');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle toast-icon';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle toast-icon';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle toast-icon';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Sample data for initial setup
function addSampleData() {
    if (students.length === 0) {
        const sampleStudents = [
            {
                id: '1',
                fullName: 'Alex Johnson',
                email: 'alex.johnson@example.com',
                phone: '9876543210',
                age: 20,
                gender: 'Male',
                course: 'Computer Science',
                address: '123 Tech Street, San Francisco, CA'
            },
            {
                id: '2',
                fullName: 'Sophia Williams',
                email: 'sophia.williams@example.com',
                phone: '8765432109',
                age: 22,
                gender: 'Female',
                course: 'Business Administration',
                address: '456 Business Ave, New York, NY'
            },
            {
                id: '3',
                fullName: 'Michael Chen',
                email: 'michael.chen@example.com',
                phone: '7654321098',
                age: 21,
                gender: 'Male',
                course: 'Engineering',
                address: '789 Engineering Blvd, Chicago, IL'
            },
            {
                id: '4',
                fullName: 'Emma Davis',
                email: 'emma.davis@example.com',
                phone: '6543210987',
                age: 23,
                gender: 'Female',
                course: 'Medicine',
                address: '101 Medical Center, Houston, TX'
            },
            {
                id: '5',
                fullName: 'Ryan Miller',
                email: 'ryan.miller@example.com',
                phone: '5432109876',
                age: 19,
                gender: 'Male',
                course: 'Design',
                address: '202 Creative Lane, Austin, TX'
            }
        ];
        
        students = sampleStudents;
        localStorage.setItem('students', JSON.stringify(students));
        renderStudents();
        updateStats();
        showToast('Sample data loaded successfully', 'success');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);