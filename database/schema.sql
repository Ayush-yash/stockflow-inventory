-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS stockflow;

-- Use the database
USE stockflow;

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity >= 0),
    minimumStock INT NOT NULL DEFAULT 0 CHECK (minimumStock >= 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO products (name, sku, category, price, quantity, minimumStock) VALUES
('Wireless Mouse', 'WM-001', 'Electronics', 25.99, 150, 20),
('Mechanical Keyboard', 'MK-002', 'Electronics', 89.50, 45, 10),
('USB-C Hub', 'UH-003', 'Accessories', 35.00, 5, 15),
('Ergonomic Chair', 'EC-004', 'Furniture', 199.99, 0, 5),
('Laptop Stand', 'LS-005', 'Accessories', 45.00, 10, 10);
