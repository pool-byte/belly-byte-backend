"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePhotoUrl = exports.getFilePath = exports.isS3Configured = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const multer_s3_1 = __importDefault(require("multer-s3"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION || 'ap-south-1';
const awsBucketName = process.env.AWS_S3_BUCKET_NAME;
exports.isS3Configured = Boolean(awsAccessKeyId &&
    awsSecretAccessKey &&
    awsBucketName &&
    awsAccessKeyId !== 'your_aws_access_key_id');
let s3ClientInstance = null;
if (exports.isS3Configured) {
    s3ClientInstance = new client_s3_1.S3Client({
        region: awsRegion,
        credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
        },
    });
}
// Helper function to resolve photo URL regardless of S3, Cloudinary, or Local Disk storage engine
const getFilePath = (file, fallback) => {
    if (!file)
        return fallback || '';
    if (file.location)
        return file.location; // AWS S3 Object URL
    if (file.key && awsBucketName) {
        return `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${file.key}`;
    }
    if (file.path && file.path.startsWith('http'))
        return file.path; // Cloudinary or remote URL
    if (file.filename)
        return `/uploads/${file.filename}`; // Local disk fallback
    return fallback || '';
};
exports.getFilePath = getFilePath;
// Converts S3 URLs to presigned GET URLs (7-day validity) so private buckets load without 403 Forbidden
const resolvePhotoUrl = async (url) => {
    if (!url)
        return '';
    if (exports.isS3Configured && s3ClientInstance && url.includes('amazonaws.com')) {
        try {
            const key = url.replace(/^https?:\/\/[^\/]+\//, '');
            const command = new client_s3_1.GetObjectCommand({
                Bucket: awsBucketName,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(s3ClientInstance, command, { expiresIn: 604800 });
        }
        catch (e) {
            console.error('Error generating presigned S3 URL:', e);
            return url;
        }
    }
    return url;
};
exports.resolvePhotoUrl = resolvePhotoUrl;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const isCloudinaryConfigured = Boolean(cloudName && cloudName !== 'your_cloud_name');
let storage;
if (exports.isS3Configured && s3ClientInstance) {
    storage = (0, multer_s3_1.default)({
        s3: s3ClientInstance,
        bucket: awsBucketName,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname) || '.jpg';
            const uniqueName = `bellybites/photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, uniqueName);
        },
    });
    console.log(`[UPLOAD] AWS S3 Permanent Storage initialized: https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/`);
}
else if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    storage = new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: async (req, file) => {
            return {
                folder: 'bellybites',
                format: 'png',
                public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            };
        },
    });
    console.log(`[UPLOAD] Cloudinary Storage initialized: ${cloudName}`);
}
else {
    // Disk Storage Fallback
    const uploadsDir = path_1.default.join(__dirname, '../../uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname) || '.jpg';
            const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, uniqueName);
        },
    });
    console.log('[UPLOAD] Local Disk Storage initialized (/uploads)');
}
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
//# sourceMappingURL=uploadMiddleware.js.map