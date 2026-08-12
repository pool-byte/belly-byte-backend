"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const Shift_1 = __importDefault(require("../models/Shift"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
const Sale_1 = __importDefault(require("../models/Sale"));
const FoodItem_1 = __importDefault(require("../models/FoodItem"));
const Alert_1 = __importDefault(require("../models/Alert"));
const ShiftReport_1 = __importDefault(require("../models/ShiftReport"));
const Item_1 = __importDefault(require("../models/Item"));
const TaskMaster_1 = __importDefault(require("../models/TaskMaster"));
async function resetDB() {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB Atlas');
        console.log('Clearing operational collections (keeping User accounts intact)...');
        await Shift_1.default.deleteMany({});
        await StockUpdate_1.default.deleteMany({});
        await Wastage_1.default.deleteMany({});
        await Sale_1.default.deleteMany({});
        await FoodItem_1.default.deleteMany({});
        await Alert_1.default.deleteMany({});
        await ShiftReport_1.default.deleteMany({});
        await Item_1.default.deleteMany({});
        await TaskMaster_1.default.deleteMany({});
        console.log('✅ Successfully wiped all DB collections except Users!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error resetting database:', err);
        process.exit(1);
    }
}
resetDB();
//# sourceMappingURL=resetDatabase.js.map