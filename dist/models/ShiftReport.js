"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const shiftReportSchema = new mongoose_1.Schema({
    shiftId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Shift', required: true, unique: true },
    dateString: { type: String, required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    workerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    workerName: { type: String, default: 'Staff' },
    closedAt: { type: Date, default: Date.now },
    itemsConsumed: [
        {
            foodItemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'FoodItem' },
            name: { type: String, required: true },
            price: { type: Number, default: 0 },
            quantitySold: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
        },
    ],
    rawMaterialUsed: [
        {
            itemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Item' },
            name: { type: String, required: true },
            unit: { type: String, default: 'kg' },
            quantityUsed: { type: Number, default: 0 },
        },
    ],
    stockSummary: [
        {
            itemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Item' },
            name: { type: String, required: true },
            unit: { type: String, default: 'kg' },
            openingStock: { type: Number, default: 0 },
            totalRestocked: { type: Number, default: 0 },
            totalAvailable: { type: Number, default: 0 },
            recipeConsumption: { type: Number, default: 0 },
            wastage: { type: Number, default: 0 },
            expectedClosing: { type: Number, default: 0 },
        },
    ],
    materialWasted: [
        {
            itemId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Item' },
            name: { type: String, required: true },
            unit: { type: String, default: 'kg' },
            quantity: { type: Number, default: 0 },
            reason: { type: String, default: '' },
            photoUrl: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    totalRevenue: { type: Number, default: 0 },
    livePhotoUrl: { type: String },
    closingPhotoUrl: { type: String },
}, { timestamps: true });
const ShiftReport = mongoose_1.default.model('ShiftReport', shiftReportSchema);
exports.default = ShiftReport;
//# sourceMappingURL=ShiftReport.js.map