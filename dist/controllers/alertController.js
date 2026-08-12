"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAlert = exports.getAlerts = void 0;
const Alert_1 = __importDefault(require("../models/Alert"));
// @desc    Get all active or resolved alerts
// @route   GET /api/alerts
// @access  Private/Admin
const getAlerts = async (req, res) => {
    try {
        const { resolved } = req.query;
        const filter = {};
        if (resolved !== undefined) {
            filter.resolved = resolved === 'true';
        }
        const alerts = await Alert_1.default.find(filter)
            .populate('itemId', 'name unit minStockAlert currentQuantity')
            .populate('shiftId')
            .sort({ createdAt: -1 });
        res.json(alerts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAlerts = getAlerts;
// @desc    Resolve an alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private/Admin
const resolveAlert = async (req, res) => {
    try {
        const alert = await Alert_1.default.findById(req.params.id);
        if (!alert) {
            res.status(404).json({ message: 'Alert not found' });
            return;
        }
        alert.resolved = true;
        const updated = await alert.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.resolveAlert = resolveAlert;
//# sourceMappingURL=alertController.js.map