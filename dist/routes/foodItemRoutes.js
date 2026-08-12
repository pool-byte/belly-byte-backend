"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const foodItemController_1 = require("../controllers/foodItemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .post(authMiddleware_1.protect, authMiddleware_1.admin, foodItemController_1.createFoodItem)
    .get(authMiddleware_1.protect, foodItemController_1.getFoodItems);
router.route('/:id')
    .get(authMiddleware_1.protect, foodItemController_1.getFoodItemById)
    .put(authMiddleware_1.protect, authMiddleware_1.admin, foodItemController_1.updateFoodItem)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, foodItemController_1.deleteFoodItem);
exports.default = router;
//# sourceMappingURL=foodItemRoutes.js.map