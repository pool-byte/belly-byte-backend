"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockLogs = exports.getWastageLogs = exports.recordWastage = exports.recordReceivedStock = exports.recordOpeningStock = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
const Item_1 = __importDefault(require("../models/Item"));
const Shift_1 = __importDefault(require("../models/Shift"));
const Alert_1 = __importDefault(require("../models/Alert"));
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
// @desc    Record Opening Stock (bulk or single for shift)
// @route   POST /api/stock/opening
// @access  Private
const recordOpeningStock = async (req, res) => {
    const { shiftId, items } = req.body;
    const userId = req.user?._id;
    try {
        let shift = null;
        if (shiftId && mongoose_1.default.Types.ObjectId.isValid(shiftId)) {
            shift = await Shift_1.default.findById(shiftId);
        }
        if (!shift) {
            shift = await Shift_1.default.findOne({
                workerId: userId,
                status: { $in: ['Opening', 'Live'] },
            });
            if (!shift) {
                shift = await Shift_1.default.create({
                    workerId: userId,
                    status: 'Opening',
                    openingStockEntered: false,
                });
            }
        }
        // Build map of uploaded files from req.files (Multer upload.any())
        const filesMap = {};
        if (Array.isArray(req.files)) {
            req.files.forEach((file) => {
                filesMap[file.fieldname] = (0, uploadMiddleware_1.getFilePath)(file);
            });
        }
        else if (req.file) {
            filesMap['photo'] = (0, uploadMiddleware_1.getFilePath)(req.file);
        }
        const updates = [];
        let itemList = [];
        if (Array.isArray(items)) {
            itemList = items;
        }
        else if (typeof items === 'string') {
            try {
                itemList = JSON.parse(items);
            }
            catch {
                itemList = [];
            }
        }
        else if (items) {
            itemList = [items];
        }
        for (const entry of itemList) {
            const { itemId, quantity } = entry;
            const rawMaterial = await Item_1.default.findById(itemId);
            if (rawMaterial) {
                rawMaterial.startingQuantity = Number(quantity);
                rawMaterial.currentQuantity = Number(quantity);
                await rawMaterial.save();
                const itemPhoto = filesMap[`itemPhoto_${itemId}`] ||
                    req.body[`itemPhoto_${itemId}`] ||
                    entry.photoUrl ||
                    filesMap['photo'] ||
                    '';
                const stockUpdate = await StockUpdate_1.default.create({
                    shiftId: shift._id,
                    itemId,
                    workerId: userId,
                    type: 'Opening',
                    quantity: Number(quantity),
                    photoUrl: itemPhoto,
                });
                updates.push(stockUpdate);
            }
        }
        shift.openingStockEntered = true;
        await shift.save();
        res.status(201).json({ message: 'Opening stock recorded successfully', updates });
    }
    catch (error) {
        console.error('Error recording opening stock:', error);
        res.status(500).json({ message: error?.message || 'Server Error', error });
    }
};
exports.recordOpeningStock = recordOpeningStock;
// @desc    Record Stock Received mid-shift
// @route   POST /api/stock/received
// @access  Private
const recordReceivedStock = async (req, res) => {
    const { shiftId, itemId, quantity } = req.body;
    const photoUrl = (0, uploadMiddleware_1.getFilePath)(req.file, req.body.photoUrl);
    const userId = req.user?._id;
    try {
        const rawMaterial = await Item_1.default.findById(itemId);
        if (!rawMaterial) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        rawMaterial.currentQuantity += Number(quantity);
        await rawMaterial.save();
        const stockUpdate = await StockUpdate_1.default.create({
            shiftId,
            itemId,
            workerId: userId,
            type: 'Received',
            quantity: Number(quantity),
            photoUrl: photoUrl || '',
        });
        res.status(201).json(stockUpdate);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.recordReceivedStock = recordReceivedStock;
// @desc    Record wastage
// @route   POST /api/stock/wastage
// @access  Private
const recordWastage = async (req, res) => {
    const { shiftId, itemId, quantity, reason, value } = req.body;
    const photoUrl = (0, uploadMiddleware_1.getFilePath)(req.file, req.body.photoUrl);
    try {
        const rawMaterial = await Item_1.default.findById(itemId);
        if (!rawMaterial) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        rawMaterial.currentQuantity = rawMaterial.currentQuantity - Number(quantity);
        await rawMaterial.save();
        // Check if stock dropped below threshold
        if (rawMaterial.currentQuantity <= rawMaterial.minStockAlert) {
            const existingAlert = await Alert_1.default.findOne({
                itemId: rawMaterial._id,
                type: 'LOW_STOCK_THRESHOLD',
                resolved: false,
            });
            if (!existingAlert) {
                await Alert_1.default.create({
                    itemId: rawMaterial._id,
                    type: 'LOW_STOCK_THRESHOLD',
                    message: `LOW STOCK ALERT: ${rawMaterial.name} is down to ${rawMaterial.currentQuantity.toFixed(3)} ${rawMaterial.unit} after wastage (Threshold: ${rawMaterial.minStockAlert} ${rawMaterial.unit}).`,
                });
            }
        }
        const wastage = await Wastage_1.default.create({
            shiftId,
            itemId,
            quantity: Number(quantity),
            reason,
            value: value ? Number(value) : 0,
            photoUrl: photoUrl || '',
        });
        res.status(201).json(wastage);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.recordWastage = recordWastage;
// @desc    Get wastage logs
// @route   GET /api/stock/wastage
// @access  Private
const getWastageLogs = async (req, res) => {
    try {
        const wastage = await Wastage_1.default.find().populate('itemId', 'name unit category').sort({ createdAt: -1 });
        const resolvedWastage = await Promise.all(wastage.map(async (w) => {
            const obj = w.toObject();
            obj.photoUrl = await (0, uploadMiddleware_1.resolvePhotoUrl)(obj.photoUrl);
            return obj;
        }));
        res.json(resolvedWastage);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getWastageLogs = getWastageLogs;
// @desc    Get stock update logs
// @route   GET /api/stock/logs
// @access  Private
const getStockLogs = async (req, res) => {
    try {
        const updates = await StockUpdate_1.default.find().populate('itemId', 'name unit').populate('workerId', 'name').sort({ createdAt: -1 });
        const wastage = await Wastage_1.default.find().populate('itemId', 'name unit').sort({ createdAt: -1 });
        const resolvedUpdates = await Promise.all(updates.map(async (u) => {
            const obj = u.toObject();
            obj.photoUrl = await (0, uploadMiddleware_1.resolvePhotoUrl)(obj.photoUrl);
            return obj;
        }));
        const resolvedWastage = await Promise.all(wastage.map(async (w) => {
            const obj = w.toObject();
            obj.photoUrl = await (0, uploadMiddleware_1.resolvePhotoUrl)(obj.photoUrl);
            return obj;
        }));
        res.json({ updates: resolvedUpdates, wastage: resolvedWastage });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getStockLogs = getStockLogs;
//# sourceMappingURL=stockController.js.map