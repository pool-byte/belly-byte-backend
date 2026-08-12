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
const TaskMaster_1 = __importDefault(require("../models/TaskMaster"));
async function cleanupSeededData() {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        const seededItemNames = [
            'Burger Buns',
            'Veggie Patty',
            'Cheese Slices',
            'Cooking Oil',
            'Special Burger Sauce',
        ];
        const seededTaskTitles = [
            'Check Gas Cylinder Connection',
            'Clean & Sanitize Counter',
            'Verify POS / Machine Battery',
            'Turn Off Griddle & Appliances',
            'Lock Storage & Cart Canopy',
        ];
        const deletedItems = await Item_1.default.deleteMany({ name: { $in: seededItemNames } });
        console.log(`Deleted ${deletedItems.deletedCount} seeded items`);
        const deletedTasks = await TaskMaster_1.default.deleteMany({ title: { $in: seededTaskTitles } });
        console.log(`Deleted ${deletedTasks.deletedCount} seeded tasks`);
        console.log('✅ Removed auto-seeded data. Only admin-created items & tasks remain!');
        process.exit(0);
    }
    catch (err) {
        console.error('Error cleaning seeded data:', err);
        process.exit(1);
    }
}
cleanupSeededData();
//# sourceMappingURL=deleteSeededData.js.map