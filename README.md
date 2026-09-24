# StockFlow - Inventory Management System

## Project Overview
StockFlow is a complete, clean, and simple Inventory Management System built as a portfolio application. It is designed to manage products, track stock levels, and provide a quick overview of inventory status through an interactive dashboard.

## Features
- **Dashboard**: View total products, total stock quantity, low-stock alerts, and out-of-stock items, along with a quick list of recently added products.
- **Product Management**: Create, Read, Update, and Delete (CRUD) products.
- **Search & Filter**: Search products by name or SKU and filter by category.
- **Stock Status**: Automatically calculates stock status (In Stock, Low Stock, Out of Stock) based on quantity and minimum stock thresholds.
- **Responsive Design**: Basic responsive frontend using pure HTML, CSS, and Vanilla JavaScript.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL (using `mysql2` driver)
- **API**: RESTful API design

## Architecture Overview
The application follows a simple client-server architecture:
1. **Frontend**: A Single Page Application (SPA) style interface built with Vanilla JavaScript interacting with the backend via the `fetch` API.
2. **Backend**: An Express.js REST API that handles business logic and routes.
3. **Database**: A MySQL database storing product information with proper constraints.

## Folder Structure
```text
stockflow-inventory/
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styling for the application
│   └── script.js         # Frontend logic and API integration
├── backend/
│   ├── src/
│   │   ├── config/       # Database configuration (db.js)
│   │   ├── controllers/  # Request handlers (productController.js)
│   │   ├── models/       # Database queries (productModel.js)
│   │   ├── routes/       # API route definitions (productRoutes.js)
│   │   └── app.js        # Express application entry point
│   ├── package.json      # Node.js dependencies and scripts
│   ├── .env              # Environment variables (Create this file)
│   └── .env.example      # Template for environment variables
├── database/
│   └── schema.sql        # SQL script to create database and tables
├── .gitignore            # Ignored files for version control
└── README.md             # Project documentation
```

## Setup Instructions

### 1. MySQL Installation/Setup
1. Install [MySQL Server](https://dev.mysql.com/downloads/mysql/).
2. Start the MySQL service.
3. Open a MySQL terminal or your preferred MySQL client (like MySQL Workbench).

### 2. Database Creation
1. Locate the `database/schema.sql` file.
2. Execute the script in your MySQL client to create the `stockflow` database, `products` table, and insert sample data.
   ```sql
   source path/to/stockflow-inventory/database/schema.sql;
   ```

### 3. Environment Variable Setup
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to a new file named `.env`.
3. Update the `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=stockflow
   PORT=3000
   ```

### 4. Backend Installation & Start
1. Open a terminal and navigate to the `backend/` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   *(For development with auto-restart, use `npm run dev`)*
4. The server will run on `http://localhost:3000`.

### 5. Frontend Start Instructions
Since the frontend uses basic HTML/CSS/JS, you can simply:
1. Navigate to the `frontend/` folder.
2. Open the `index.html` file in your browser (e.g., double-click it, or use a tool like VS Code Live Server).

## API Endpoint Documentation

Base URL: `http://localhost:3000/api/products`

| Method | Endpoint      | Description           |
|--------|---------------|-----------------------|
| GET    | `/`           | Get all products      |
| GET    | `/:id`        | Get a product by ID   |
| POST   | `/`           | Create a new product  |
| PUT    | `/:id`        | Update a product      |
| DELETE | `/:id`        | Delete a product      |
| GET    | `/health`     | Health check endpoint |

### Example API Requests

**Create Product (POST `/`)**
```json
{
  "name": "Gaming Headset",
  "sku": "GH-101",
  "category": "Electronics",
  "price": 59.99,
  "quantity": 25,
  "minimumStock": 10
}
```

**Health Check (GET `/health`)**
```json
{
  "status": "UP"
}
```

## API Validation
The API enforces the following input validation rules for creating and updating products:
- `name`, `sku`, and `category` cannot be empty.
- `price`, `quantity`, and `minimumStock` must be valid positive numbers (`>= 0`).
- `sku` must be strictly unique across the database.

**Common HTTP Status Codes:**
- `200 OK`: Request succeeded.
- `201 Created`: Product successfully created.
- `400 Bad Request`: Validation failure (e.g., negative numbers, missing fields).
- `404 Not Found`: The requested product ID does not exist.
- `409 Conflict`: Attempted to create or update a product with an existing `sku`.
- `500 Internal Server Error`: Unexpected server issue.

## Testing
This project uses **Jest** and **Supertest** for automated API integration testing without breaking production data.

### Test Database Setup
Tests safely isolate data by using a dedicated test database (`stockflow_test`). 
Before running tests, create the test database manually in your MySQL instance:
```sql
CREATE DATABASE IF NOT EXISTS stockflow_test;
```

### Running Tests
Inside the `backend/` directory, you can execute the test suite:
```bash
npm test
```
To run tests in watch mode (auto-rerun on file save):
```bash
npm run test:watch
```

**Test Coverage:**
- `/health` endpoint status verification.
- Complete CRUD operations (`GET`, `POST`, `PUT`, `DELETE`).
- Validation enforcement mapping to correct `400` and `409` HTTP codes.
- "Product Not Found" scenarios (`404`).

## Security
- **Parameterization:** All SQL queries are strictly parameterized to prevent SQL Injection attacks.
- **Environment Variables:** Credentials are securely managed using the `dotenv` package.
- **.env Protection:** `.env` is safely ignored by Git inside `.gitignore`, ensuring secrets are never leaked to source control.
- **Error Handling:** Backend securely catches and suppresses database stack traces, returning only clean JSON error messages.

## Troubleshooting
- **Database Connection Error**: Ensure MySQL is running and the credentials in the `backend/.env` file are correct.
- **CORS Errors**: Make sure the backend server is running on the correct port (3000) and the `cors` middleware is applied in `app.js`.
- **API Not Found**: Ensure the backend server is running (`npm start`) before trying to interact with the frontend.
