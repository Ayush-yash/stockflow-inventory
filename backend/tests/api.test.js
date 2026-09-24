const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// Ensure we are in test environment
beforeAll(async () => {
    // Create products table in test db if it doesn't exist
    await db.query(`
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
    `);
});

beforeEach(async () => {
    // Clean up table before each test
    await db.query('DELETE FROM products');
    // Insert a base product for testing
    await db.query(`
        INSERT INTO products (name, sku, category, price, quantity, minimumStock) 
        VALUES ('Test Mouse', 'TM-001', 'Electronics', 25.99, 150, 20)
    `);
});

afterAll(async () => {
    await db.query('DROP TABLE IF EXISTS products');
    await db.end();
});

describe('Health Endpoint', () => {
    it('should return status UP', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'UP');
    });
});

describe('Products API', () => {
    describe('GET /api/products', () => {
        it('should return all products', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toHaveProperty('sku', 'TM-001');
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return a specific product by ID', async () => {
            // Fetch first to get valid ID
            const products = await request(app).get('/api/products');
            const validId = products.body[0].id;

            const res = await request(app).get(`/api/products/${validId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('sku', 'TM-001');
        });

        it('should return 404 for non-existing product', async () => {
            const res = await request(app).get('/api/products/99999');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });
    });

    describe('POST /api/products', () => {
        it('should create a valid product', async () => {
            const newProduct = {
                name: 'New Keyboard',
                sku: 'NK-002',
                category: 'Electronics',
                price: 49.99,
                quantity: 50,
                minimumStock: 5
            };
            const res = await request(app).post('/api/products').send(newProduct);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Product created successfully');
            expect(res.body).toHaveProperty('id');
        });

        it('should return 400 for missing required fields (name)', async () => {
            const invalidProduct = {
                sku: 'NK-002',
                category: 'Electronics',
                price: 49.99,
                quantity: 50
            };
            const res = await request(app).post('/api/products').send(invalidProduct);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Please provide all required fields');
        });

        it('should return 400 for negative price', async () => {
            const invalidProduct = {
                name: 'New Keyboard',
                sku: 'NK-002',
                category: 'Electronics',
                price: -10,
                quantity: 50
            };
            const res = await request(app).post('/api/products').send(invalidProduct);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('positive numbers');
        });

        it('should return 409 for duplicate SKU', async () => {
            const duplicateProduct = {
                name: 'Another Mouse',
                sku: 'TM-001', // Already exists in beforeEach
                category: 'Electronics',
                price: 15.99,
                quantity: 10
            };
            const res = await request(app).post('/api/products').send(duplicateProduct);
            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', 'SKU must be unique');
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update an existing product', async () => {
            const products = await request(app).get('/api/products');
            const validId = products.body[0].id;

            const updateData = {
                name: 'Updated Mouse',
                sku: 'TM-001',
                category: 'Electronics',
                price: 29.99,
                quantity: 140,
                minimumStock: 25
            };

            const res = await request(app).put(`/api/products/${validId}`).send(updateData);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Product updated successfully');
        });

        it('should return 404 for updating non-existing product', async () => {
            const updateData = {
                name: 'Ghost Product',
                sku: 'GP-001',
                category: 'None',
                price: 0,
                quantity: 0
            };
            const res = await request(app).put('/api/products/99999').send(updateData);
            expect(res.statusCode).toEqual(404);
        });

        it('should return 409 when changing SKU to an existing SKU', async () => {
            // Create a second product
            await request(app).post('/api/products').send({
                name: 'Second Product',
                sku: 'SP-002',
                category: 'Misc',
                price: 10,
                quantity: 10
            });

            // Try to update first product's SKU to second product's SKU
            const products = await request(app).get('/api/products');
            const firstId = products.body[0].id; // id for TM-001

            const res = await request(app).put(`/api/products/${firstId}`).send({
                name: 'Changed Name',
                sku: 'SP-002', // conflict
                category: 'Electronics',
                price: 29.99,
                quantity: 140
            });

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('message', 'SKU must be unique');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete an existing product', async () => {
            const products = await request(app).get('/api/products');
            const validId = products.body[0].id;

            const res = await request(app).delete(`/api/products/${validId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Product deleted successfully');
        });

        it('should return 404 for deleting non-existing product', async () => {
            const res = await request(app).delete('/api/products/99999');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });
    });
});
