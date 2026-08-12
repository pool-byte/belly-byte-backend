require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'Worker'], default: 'Worker' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bellybites';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    // Delete existing users with these phone numbers to ensure fresh password hash
    await User.deleteMany({ phone: { $in: ['9999999999', '9876543210', '1111111111', '7017359581'] } });

    // 1. Create Admin User
    const admin = await User.create({
      name: 'Suresh (Owner)',
      phone: '7017359581',
      password: '12345',
      role: 'Admin',
    });
    console.log('✅ Created Admin user:', admin.name, 'Phone:', admin.phone);

    // 2. Create Worker User
    const worker = await User.create({
      name: 'Ramesh (Staff)',
      phone: '1111111111',
      password: '12345',
      role: 'Worker',
    });
    console.log('✅ Created Worker user:', worker.name, 'Phone:', worker.phone);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
}

seedAdmin();
