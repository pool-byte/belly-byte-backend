"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function test() {
    const s3 = new client_s3_1.S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    const command = new client_s3_1.GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: 'bellybites/photo-1786560595671-416409929.jpeg',
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 604800 });
    console.log('Generated Presigned URL:\n', url);
    const res = await fetch(url);
    console.log('Fetch Status:', res.status, res.statusText);
}
test();
//# sourceMappingURL=testPresignedUrl.js.map