const db = require('../config/db');

class Product {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM products ORDER BY createdAt DESC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }

    static async getBySku(sku) {
        const [rows] = await db.query('SELECT * FROM products WHERE sku = ?', [sku]);
        return rows[0];
    }

    static async create(data) {
        const { name, sku, category, price, quantity, minimumStock } = data;
        const [result] = await db.query(
            'INSERT INTO products (name, sku, category, price, quantity, minimumStock) VALUES (?, ?, ?, ?, ?, ?)',
            [name, sku, category, price, quantity, minimumStock || 0]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, sku, category, price, quantity, minimumStock } = data;
        const [result] = await db.query(
            'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, quantity = ?, minimumStock = ? WHERE id = ?',
            [name, sku, category, price, quantity, minimumStock || 0, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Product;
