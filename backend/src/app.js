const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

const { uploadToS3 } = require('./utils/s3Upload');
const path = require('path');

// Test S3 Route
app.get('/test-s3', async (req, res) => {
  try {
    // Using the dummy test file we created
    const testFilePath = path.join(__dirname, '../test-image.txt');
    // Using Date.now() so multiple test uploads don't overwrite each other
    const fileUrl = await uploadToS3(testFilePath, `test-image-${Date.now()}.txt`);
    res.status(200).json({ 
      message: "File successfully uploaded to AWS S3!", 
      url: fileUrl 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to upload file to S3", 
      error: error.message 
    });
  }
});

// API Routes
app.use('/api/products', productRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Export the app for testing
module.exports = app;
