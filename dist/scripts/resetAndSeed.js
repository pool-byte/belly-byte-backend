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
const Item_1 = __importDefault(require("../models/Item"));
const FoodItem_1 = __importDefault(require("../models/FoodItem"));
const Shift_1 = __importDefault(require("../models/Shift"));
const ShiftReport_1 = __importDefault(require("../models/ShiftReport"));
const Sale_1 = __importDefault(require("../models/Sale"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
const Alert_1 = __importDefault(require("../models/Alert"));
const TaskMaster_1 = __importDefault(require("../models/TaskMaster"));
const shiftReportService_1 = require("../services/shiftReportService");
const resetAndSeed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || '';
        if (!mongoUri) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB for clean reset and seeding...');
        // 1. CLEAR ALL COLLECTIONS EXCEPT USERS
        console.log('Clearing old data (preserving Users)...');
        await Shift_1.default.deleteMany({});
        await ShiftReport_1.default.deleteMany({});
        await Sale_1.default.deleteMany({});
        await StockUpdate_1.default.deleteMany({});
        await Wastage_1.default.deleteMany({});
        await Alert_1.default.deleteMany({});
        await Item_1.default.deleteMany({});
        await FoodItem_1.default.deleteMany({});
        await TaskMaster_1.default.deleteMany({});
        // Seed Default Opening & Closing Tasks
        console.log('Creating default task master items...');
        await TaskMaster_1.default.create([
            { title: 'Check Gas Cylinder Pressure & Pipe Leakage', type: 'Opening', requiresPhoto: true },
            { title: 'Sanitize Food Prep Counter & Appliances', type: 'Opening', requiresPhoto: true },
            { title: 'Verify Live Security Camera & Lighting', type: 'Opening', requiresPhoto: true },
            { title: 'Lock Cart Main Drawer & Wheel Chains', type: 'Closing', requiresPhoto: true },
            { title: 'Pack & Store Remaining Cold Raw Materials', type: 'Closing', requiresPhoto: true },
            { title: 'Dispose Waste & Clean Trash Bin Area', type: 'Closing', requiresPhoto: true },
        ]);
        // Fetch Worker User
        const worker = await User_1.default.findOne({ role: 'worker' });
        const workerId = worker ? worker._id : new mongoose_1.default.Types.ObjectId();
        // 2. CREATE RAW MATERIAL MASTER ITEMS
        console.log('Creating Master Raw Materials...');
        const cheese = await Item_1.default.create({
            name: 'Cheese',
            unit: 'kg',
            startingQuantity: 10,
            currentQuantity: 8.5,
            minStockAlert: 2,
        });
        const milk = await Item_1.default.create({
            name: 'Milk',
            unit: 'L',
            startingQuantity: 20,
            currentQuantity: 15,
            minStockAlert: 5,
        });
        const coffeeBeans = await Item_1.default.create({
            name: 'Coffee Beans',
            unit: 'kg',
            startingQuantity: 5,
            currentQuantity: 4,
            minStockAlert: 1,
        });
        const bun = await Item_1.default.create({
            name: 'Bread Bun',
            unit: 'pcs',
            startingQuantity: 100,
            currentQuantity: 80,
            minStockAlert: 20,
        });
        const butter = await Item_1.default.create({
            name: 'Butter',
            unit: 'g',
            startingQuantity: 2000,
            currentQuantity: 1500,
            minStockAlert: 300,
        });
        const chocoSyrup = await Item_1.default.create({
            name: 'Chocolate Syrup',
            unit: 'ml',
            startingQuantity: 3000,
            currentQuantity: 2500,
            minStockAlert: 500,
        });
        // 3. CREATE RECIPES (FOOD ITEMS)
        console.log('Creating Food Items (Recipes)...');
        const cheeseSandwich = await FoodItem_1.default.create({
            name: 'Cheese Sandwich',
            price: 120,
            ingredients: [
                { itemId: cheese._id, quantityUsed: 50, unit: 'g' },
                { itemId: bun._id, quantityUsed: 2, unit: 'pcs' },
                { itemId: butter._id, quantityUsed: 20, unit: 'g' },
            ],
        });
        const cappuccino = await FoodItem_1.default.create({
            name: 'Cappuccino Coffee',
            price: 80,
            ingredients: [
                { itemId: milk._id, quantityUsed: 200, unit: 'ml' },
                { itemId: coffeeBeans._id, quantityUsed: 15, unit: 'g' },
            ],
        });
        const hotChocolate = await FoodItem_1.default.create({
            name: 'Hot Chocolate',
            price: 90,
            ingredients: [
                { itemId: milk._id, quantityUsed: 250, unit: 'ml' },
                { itemId: chocoSyrup._id, quantityUsed: 30, unit: 'ml' },
            ],
        });
        // 4. CREATE HISTORICAL CLOSED SHIFT & SHIFT REPORT (FOR YESTERDAY 2026-08-11)
        console.log('Creating historical shift report for 2026-08-11...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(9, 0, 0, 0);
        const yesterdayClose = new Date(yesterday);
        yesterdayClose.setHours(21, 0, 0, 0);
        const closedShift = await Shift_1.default.create({
            workerId,
            date: yesterday,
            goLiveTime: new Date(yesterday.getTime() + 30 * 60000),
            closeTime: yesterdayClose,
            status: 'Closed',
            openingStockEntered: true,
            cartLiveChecklist: {
                rawMaterialCountVerified: true,
                preparationsReady: true,
                hygieneOk: true,
                livePhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                notes: 'Opening ready for business',
            },
            closingChecklist: {
                cartLocked: true,
                chainLocked: true,
                remainingStockPacked: true,
                closingPhotoUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80',
                notes: 'Shift completed successfully',
            },
        });
        // Opening Stock Logs for Yesterday's Shift
        await StockUpdate_1.default.create([
            { shiftId: closedShift._id, itemId: cheese._id, workerId, type: 'Opening', quantity: 10, time: yesterday },
            { shiftId: closedShift._id, itemId: milk._id, workerId, type: 'Opening', quantity: 20, time: yesterday },
            { shiftId: closedShift._id, itemId: coffeeBeans._id, workerId, type: 'Opening', quantity: 5, time: yesterday },
            { shiftId: closedShift._id, itemId: bun._id, workerId, type: 'Opening', quantity: 100, time: yesterday },
            { shiftId: closedShift._id, itemId: butter._id, workerId, type: 'Opening', quantity: 2000, time: yesterday },
            { shiftId: closedShift._id, itemId: chocoSyrup._id, workerId, type: 'Opening', quantity: 3000, time: yesterday },
        ]);
        // Mid-shift Restocks
        await StockUpdate_1.default.create([
            {
                shiftId: closedShift._id,
                itemId: cheese._id,
                workerId,
                type: 'Received',
                quantity: 3,
                photoUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
                time: new Date(yesterday.getTime() + 4 * 3600000),
            },
            {
                shiftId: closedShift._id,
                itemId: milk._id,
                workerId,
                type: 'Received',
                quantity: 10,
                photoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
                time: new Date(yesterday.getTime() + 5 * 3600000),
            },
        ]);
        // Hourly Sales for Yesterday
        await Sale_1.default.create([
            { shiftId: closedShift._id, foodItemId: cheeseSandwich._id, quantity: 10, totalPrice: 1200, hour: 12, time: yesterday },
            { shiftId: closedShift._id, foodItemId: cappuccino._id, quantity: 15, totalPrice: 1200, hour: 14, time: yesterday },
            { shiftId: closedShift._id, foodItemId: hotChocolate._id, quantity: 5, totalPrice: 450, hour: 16, time: yesterday },
        ]);
        // Wastage Logs for Yesterday
        await Wastage_1.default.create([
            {
                shiftId: closedShift._id,
                itemId: bun._id,
                quantity: 2,
                reason: 'Packaging damaged during delivery',
                photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
                time: yesterday,
            },
            {
                shiftId: closedShift._id,
                itemId: milk._id,
                quantity: 0.2,
                reason: 'Accidental spill during steam heating',
                photoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
                time: yesterday,
            },
        ]);
        // Generate and save shift report for yesterday
        await (0, shiftReportService_1.createShiftReport)(closedShift._id.toString());
        // 5. CREATE ACTIVE LIVE SHIFT FOR TODAY
        console.log('Creating active live shift for today...');
        const today = new Date();
        const activeShift = await Shift_1.default.create({
            workerId,
            date: today,
            goLiveTime: today,
            status: 'Live',
            openingStockEntered: true,
            cartLiveChecklist: {
                rawMaterialCountVerified: true,
                preparationsReady: true,
                hygieneOk: true,
                livePhotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                notes: 'Morning shift active',
            },
        });
        // Opening stock for today's active shift
        await StockUpdate_1.default.create([
            { shiftId: activeShift._id, itemId: cheese._id, workerId, type: 'Opening', quantity: 8.5, time: today },
            { shiftId: activeShift._id, itemId: milk._id, workerId, type: 'Opening', quantity: 15, time: today },
            { shiftId: activeShift._id, itemId: coffeeBeans._id, workerId, type: 'Opening', quantity: 4, time: today },
            { shiftId: activeShift._id, itemId: bun._id, workerId, type: 'Opening', quantity: 80, time: today },
            { shiftId: activeShift._id, itemId: butter._id, workerId, type: 'Opening', quantity: 1500, time: today },
            { shiftId: activeShift._id, itemId: chocoSyrup._id, workerId, type: 'Opening', quantity: 2500, time: today },
        ]);
        console.log('Successfully reset database and seeded fresh dummy data!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error during reset and seed:', error);
        process.exit(1);
    }
};
resetAndSeed();
//# sourceMappingURL=resetAndSeed.js.map