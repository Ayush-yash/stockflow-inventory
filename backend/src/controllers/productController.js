const Product = require('../models/productModel');
const { uploadToS3 } = require('../utils/s3Upload');

const getProducts = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.getById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error while fetching product' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, sku, category, price, quantity, minimumStock } = req.body;
        
        // Basic validation
        if (!name || !sku || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        if (price < 0 || quantity < 0 || (minimumStock !== undefined && minimumStock < 0)) {
            return res.status(400).json({ message: 'Price, quantity, and minimum stock must be positive numbers' });
        }

        // Check SKU uniqueness
        const existingProduct = await Product.getBySku(sku);
        if (existingProduct) {
            return res.status(409).json({ message: 'SKU must be unique' });
        }

        let imageUrl = null;
        if (req.file) {
            const fileName = `product-${Date.now()}-${req.file.originalname}`;
            imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
        }

        const newId = await Product.create({ name, sku, category, price, quantity, minimumStock, imageUrl });
        res.status(201).json({ id: newId, message: 'Product created successfully', imageUrl });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error while creating product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, sku, category, price, quantity, minimumStock } = req.body;
        
        // Basic validation
        if (!name || !sku || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        if (price < 0 || quantity < 0 || (minimumStock !== undefined && minimumStock < 0)) {
            return res.status(400).json({ message: 'Price, quantity, and minimum stock must be positive numbers' });
        }

        const existingProduct = await Product.getById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if new SKU belongs to another product
        if (sku !== existingProduct.sku) {
            const productWithSku = await Product.getBySku(sku);
            if (productWithSku) {
                return res.status(409).json({ message: 'SKU must be unique' });
            }
        }

        let imageUrl = undefined;
        if (req.file) {
            const fileName = `product-${Date.now()}-${req.file.originalname}`;
            imageUrl = await uploadToS3(req.file.buffer, fileName, req.file.mimetype);
        }

        await Product.update(id, { name, sku, category, price, quantity, minimumStock, imageUrl });
        res.json({ message: 'Product updated successfully', imageUrl });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error while updating product' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const affectedRows = await Product.delete(id);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
