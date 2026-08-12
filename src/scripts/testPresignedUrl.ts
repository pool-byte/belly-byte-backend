import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function test() {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: 'bellybites/photo-1786560595671-416409929.jpeg',
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 604800 });
  console.log('Generated Presigned URL:\n', url);

  const res = await fetch(url);
  console.log('Fetch Status:', res.status, res.statusText);
}

test();
