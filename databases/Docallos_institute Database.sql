CREATE DATABASE docallos_Institute;
USE docallos_Institute;

-- For aunthentication
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainee profiles(Personal information)
CREATE TABLE trainee_profiles (
	profile_id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(10),
    birthday DATE NOT NULL,
    sex ENUM('Male', 'Female') NOT NULL,
    contact_number VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    street VARCHAR(100) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    FOREIGN KEY(users_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE training_programs (
	program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR (255) NOT NULL,
    descriptions TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_hours INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    max_capacity INT NOT NULL,
    current_enrollment INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (program_id) REFERENCES training_programs(program_id),
    CHECK (end_datetime > start_datetime)
);

CREATE TABLE payment_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type ENUM('BPI', 'GCash') NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

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
    payment_date TIMESTAMP NULL,
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (schedule_id) REFERENCES training_schedules(schedule_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id)
);

CREATE TABLE payment_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('BPI', 'GCash') NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    notes TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);








