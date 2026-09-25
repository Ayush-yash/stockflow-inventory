const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("File successfully uploaded to S3.");
    // Return the public URL of the uploaded image
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};

module.exports = { uploadToS3 };
