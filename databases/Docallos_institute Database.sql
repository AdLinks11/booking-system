CREATE DATABASE docallos_institute;
USE docallos_institute;

-- Users table (for authentication and personal information)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_registered BOOLEAN DEFAULT FALSE, -- Tracks if user has completed registration
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    suffix VARCHAR(10),
    birthday DATE,
    sex ENUM('Male', 'Female', 'Other'),
    contact_number VARCHAR(20),
    city VARCHAR(100),
    house_number VARCHAR(50),
    street VARCHAR(100),
    barangay VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Training programs table
CREATE TABLE training_programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    descriptions TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_hours INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training schedules table
CREATE TABLE training_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    max_capacity INT NOT NULL,
    current_enrollment INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    reason_inactive TEXT,
    FOREIGN KEY (program_id) REFERENCES training_programs(program_id) ON DELETE CASCADE,
    CHECK (end_datetime > start_datetime),
    INDEX idx_program_id (program_id),
    INDEX idx_start_datetime (start_datetime)
);

-- Payment accounts table
CREATE TABLE payment_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type ENUM('BPI', 'GCash') NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table (includes payment details)
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    payment_method ENUM('BPI', 'GCash') NOT NULL,
    payment_proof_path VARCHAR(255) NOT NULL,
    valid_id_path VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    downpayment_amount DECIMAL(10,2) DEFAULT 500.00,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INT,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES training_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_status (status)
);

-- Completed trainings table (for student profile history)
CREATE TABLE completed_trainings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    completion_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES training_schedules(schedule_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);