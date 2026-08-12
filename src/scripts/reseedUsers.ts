import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
import User from '../models/User';

async function reseed() {
  try {
    const mongoUri = process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    await User.deleteMany({ phone: { $in: ['7017359581', '1111111111', '9876543210', '9999999999'] } });

    const admin = await User.create({
      name: 'Suresh (Owner)',
      phone: '7017359581',
      password: '12345',
      role: 'Admin',
    });

    const worker = await User.create({
      name: 'Ramesh (Staff)',
      phone: '1111111111',
      password: '12345',
      role: 'Worker',
    });

    console.log('✅ Reseeded Admin user:', admin.phone, 'Role:', admin.role);
    console.log('✅ Reseeded Worker user:', worker.phone, 'Role:', worker.role);

    const testAdmin = await admin.matchPassword('12345');
    const testWorker = await worker.matchPassword('12345');

    console.log('Admin password match test (12345):', testAdmin);
    console.log('Worker password match test (12345):', testWorker);

    process.exit(0);
  } catch (err) {
    console.error('Error reseeding users:', err);
    process.exit(1);
  }
}

reseed();
