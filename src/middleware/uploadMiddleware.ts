import multer from 'multer';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multerS3 from 'multer-s3';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const awsBucketName = process.env.AWS_S3_BUCKET_NAME;

export const isS3Configured = Boolean(
  awsAccessKeyId &&
  awsSecretAccessKey &&
  awsBucketName &&
  awsAccessKeyId !== 'your_aws_access_key_id'
);

let s3ClientInstance: S3Client | null = null;
if (isS3Configured) {
  s3ClientInstance = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId as string,
      secretAccessKey: awsSecretAccessKey as string,
    },
  });
}

// Helper function to resolve photo URL regardless of S3, Cloudinary, or Local Disk storage engine
export const getFilePath = (file?: Express.Multer.File, fallback?: string): string => {
  if (!file) return fallback || '';
  if ((file as any).location) return (file as any).location; // AWS S3 Object URL
  if ((file as any).key && awsBucketName) {
    return `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${(file as any).key}`;
  }
  if (file.path && file.path.startsWith('http')) return file.path; // Cloudinary or remote URL
  if (file.filename) return `/uploads/${file.filename}`; // Local disk fallback
  return fallback || '';
};

// Converts S3 URLs to presigned GET URLs (7-day validity) so private buckets load without 403 Forbidden
export const resolvePhotoUrl = async (url?: string): Promise<string> => {
  if (!url) return '';
  if (isS3Configured && s3ClientInstance && url.includes('amazonaws.com')) {
    try {
      const key = url.replace(/^https?:\/\/[^\/]+\//, '');
      const command = new GetObjectCommand({
        Bucket: awsBucketName,
        Key: key,
      });
      return await getSignedUrl(s3ClientInstance, command, { expiresIn: 604800 });
    } catch (e) {
      console.error('Error generating presigned S3 URL:', e);
      return url;
    }
  }
  return url;
};

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const isCloudinaryConfigured = Boolean(cloudName && cloudName !== 'your_cloud_name');

let storage: any;

if (isS3Configured && s3ClientInstance) {
  storage = multerS3({
    s3: s3ClientInstance,
    bucket: awsBucketName as string,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const uniqueName = `bellybites/photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
  console.log(`[UPLOAD] AWS S3 Permanent Storage initialized: https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/`);
} else if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: 'bellybites',
        format: 'png',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      };
    },
  });
  console.log(`[UPLOAD] Cloudinary Storage initialized: ${cloudName}`);
} else {
  // Disk Storage Fallback
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
  console.log('[UPLOAD] Local Disk Storage initialized (/uploads)');
}

const upload = multer({ storage: storage });
export default upload;
