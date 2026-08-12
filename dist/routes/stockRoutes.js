"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stockController_1 = require("../controllers/stockController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = express_1.default.Router();
router.post('/opening', authMiddleware_1.protect, uploadMiddleware_1.default.any(), stockController_1.recordOpeningStock);
router.post('/received', authMiddleware_1.protect, uploadMiddleware_1.default.single('photo'), stockController_1.recordReceivedStock);
router.route('/wastage')
    .post(authMiddleware_1.protect, uploadMiddleware_1.default.single('photo'), stockController_1.recordWastage)
    .get(authMiddleware_1.protect, stockController_1.getWastageLogs);
router.get('/logs', authMiddleware_1.protect, stockController_1.getStockLogs);
exports.default = router;
//# sourceMappingURL=stockRoutes.js.map