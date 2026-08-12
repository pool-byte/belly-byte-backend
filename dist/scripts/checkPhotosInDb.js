"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const Item_1 = __importDefault(require("../models/Item"));
const Shift_1 = __importDefault(require("../models/Shift"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
async function checkPhotos() {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        // Register Item model
        await Item_1.default.findOne({});
        const stockUpdates = await StockUpdate_1.default.find({}).populate('itemId', 'name');
        console.log(`\n--- StockUpdates count: ${stockUpdates.length} ---`);
        stockUpdates.forEach((su) => {
            console.log({
                id: su._id,
                type: su.type,
                item: su.itemId?.name || su.itemId,
                photoUrl: su.photoUrl,
                time: su.createdAt,
            });
        });
        const shifts = await Shift_1.default.find({});
        console.log(`\n--- Shifts count: ${shifts.length} ---`);
        shifts.forEach((s) => {
            console.log({
                id: s._id,
                status: s.status,
                cartLivePhoto: s.cartLiveChecklist?.livePhotoUrl,
                closingPhoto: s.closingChecklist?.closingPhotoUrl,
                taskSubmissionsCount: s.taskSubmissions?.length,
                taskSubmissions: s.taskSubmissions?.map((ts) => ({ title: ts.title, photoUrl: ts.photoUrl })),
            });
        });
        const wastage = await Wastage_1.default.find({});
        console.log(`\n--- Wastage count: ${wastage.length} ---`);
        wastage.forEach((w) => {
            console.log({
                id: w._id,
                photoUrl: w.photoUrl,
            });
        });
        process.exit(0);
    }
    catch (err) {
        console.error('Error checking photos in DB:', err);
        process.exit(1);
    }
}
checkPhotos();
//# sourceMappingURL=checkPhotosInDb.js.map