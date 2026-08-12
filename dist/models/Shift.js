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
const shiftSchema = new mongoose_1.Schema({
    date: { type: Date, required: true, default: Date.now },
    workerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['Opening', 'Live', 'Closed'], default: 'Opening' },
    goLiveTime: { type: Date },
    closeTime: { type: Date },
    openingStockEntered: { type: Boolean, default: false },
    cartLiveChecklist: {
        locationVerified: { type: Boolean, default: false },
        preparationDone: { type: Boolean, default: false },
        grillingSetup: { type: Boolean, default: false },
        chargingLightWorking: { type: Boolean, default: false },
        cameraActive: { type: Boolean, default: false },
        cartLiveStatus: { type: Boolean, default: false },
        livePhotoUrl: { type: String },
        notes: { type: String },
    },
    closingChecklist: {
        cartLocked: { type: Boolean, default: false },
        chainLocked: { type: Boolean, default: false },
        remainingStockPacked: { type: Boolean, default: false },
        closingPhotoUrl: { type: String },
        notes: { type: String },
    },
    taskSubmissions: [
        {
            taskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TaskMaster' },
            title: { type: String, required: true },
            type: { type: String, required: true, enum: ['Opening', 'Closing'] },
            completed: { type: Boolean, default: false },
            photoUrl: { type: String },
            submittedAt: { type: Date, default: Date.now },
        },
    ],
    dayTotalSalesSubmitted: { type: Number },
    reconciled: { type: Boolean, default: false },
}, { timestamps: true });
const Shift = mongoose_1.default.model('Shift', shiftSchema);
exports.default = Shift;
//# sourceMappingURL=Shift.js.map