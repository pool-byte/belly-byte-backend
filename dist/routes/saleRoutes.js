"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saleController_1 = require("../controllers/saleController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/hourly')
    .post(authMiddleware_1.protect, saleController_1.recordHourlySale)
    .get(authMiddleware_1.protect, saleController_1.getHourlySales);
router.post('/reconcile', authMiddleware_1.protect, authMiddleware_1.admin, saleController_1.reconcileDailySales);
router.route('/:id')
    .put(authMiddleware_1.protect, saleController_1.updateSale)
    .delete(authMiddleware_1.protect, saleController_1.deleteSale);
// Backwards compatibility endpoint
router.route('/')
    .post(authMiddleware_1.protect, saleController_1.recordHourlySale)
    .get(authMiddleware_1.protect, saleController_1.getHourlySales);
exports.default = router;
//# sourceMappingURL=saleRoutes.js.map