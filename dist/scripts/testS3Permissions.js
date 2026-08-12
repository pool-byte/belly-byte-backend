"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function check() {
    const s3 = new client_s3_1.S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    try {
        const putRes = await s3.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: 'test-check.txt',
            Body: 'Hello AWS S3',
        }));
        console.log('PutObject successful:', putRes);
        const getRes = await s3.send(new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: 'test-check.txt',
        }));
        const str = await getRes.Body?.transformToString();
        console.log('GetObject successful:', str);
    }
    catch (err) {
        console.error('S3 Operation Error:', err);
    }
}
check();
//# sourceMappingURL=testS3Permissions.js.map