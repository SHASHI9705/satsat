import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

import path from 'path';
import dotenv from 'dotenv';


dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});


const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME as string; // Ensure BUCKET_NAME is treated as a string

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const fileKey = `${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: BUCKET_NAME, // BUCKET_NAME is now guaranteed to be a string
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the file URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Add deleteFromS3 function
export const deleteFromS3 = async (fileKey: string): Promise<void> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`File deleted successfully: ${fileKey}`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};