"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemController_1 = require("../controllers/itemController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.protect, itemController_1.getItems)
    .post(authMiddleware_1.protect, authMiddleware_1.admin, itemController_1.createItem);
router.route('/:id')
    .get(authMiddleware_1.protect, itemController_1.getItemById)
    .put(authMiddleware_1.protect, authMiddleware_1.admin, itemController_1.updateItem)
    .delete(authMiddleware_1.protect, authMiddleware_1.admin, itemController_1.deleteItem);
exports.default = router;
//# sourceMappingURL=itemRoutes.js.map