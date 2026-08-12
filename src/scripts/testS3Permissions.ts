import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  try {
    const putRes = await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: 'test-check.txt',
      Body: 'Hello AWS S3',
    }));
    console.log('PutObject successful:', putRes);

    const getRes = await s3.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: 'test-check.txt',
    }));
    const str = await getRes.Body?.transformToString();
    console.log('GetObject successful:', str);
  } catch (err: any) {
    console.error('S3 Operation Error:', err);
  }
}

check();
