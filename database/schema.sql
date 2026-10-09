CREATE DATABASE IF NOT EXISTS research_portal;
USE research_portal;

CREATE TABLE IF NOT EXISTS research_opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    area VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open'
);

INSERT INTO research_opportunities (title, description, area, faculty_name, department, required_skills, available_positions, application_deadline, status)
VALUES 
('Machine Learning for Healthcare', 'Developing predictive models for patient outcomes.', 'Machine Learning', 'Dr. Alice Smith', 'Computer Science', 'Python, PyTorch, SQL', 2, '2026-12-01', 'Open'),
('Quantum Computing Algorithms', 'Research on quantum error correction.', 'Quantum Computing', 'Dr. Bob Jones', 'Physics', 'Linear Algebra, Qiskit', 1, '2026-11-15', 'Open'),
('IoT Security Frameworks', 'Investigating vulnerabilities in smart home devices.', 'Cybersecurity', 'Dr. Carol White', 'Electrical Engineering', 'C++, Networking, Cryptography', 3, '2026-10-31', 'Open');
