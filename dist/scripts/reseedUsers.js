"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const User_1 = __importDefault(require("../models/User"));
async function reseed() {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        await User_1.default.deleteMany({ phone: { $in: ['7017359581', '1111111111', '9876543210', '9999999999'] } });
        const admin = await User_1.default.create({
            name: 'Suresh (Owner)',
            phone: '7017359581',
            password: '12345',
            role: 'Admin',
        });
        const worker = await User_1.default.create({
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
    }
    catch (err) {
        console.error('Error reseeding users:', err);
        process.exit(1);
    }
}
reseed();
//# sourceMappingURL=reseedUsers.js.map