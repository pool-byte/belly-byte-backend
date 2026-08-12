"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shiftController_1 = require("../controllers/shiftController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = express_1.default.Router();
router.get('/current', authMiddleware_1.protect, shiftController_1.getCurrentShift);
router.get('/status-photos', authMiddleware_1.protect, authMiddleware_1.admin, shiftController_1.getShiftStatusAndPhotos);
router.get('/', authMiddleware_1.protect, shiftController_1.getShifts);
router.get('/:id', authMiddleware_1.protect, shiftController_1.getShiftById);
router.post('/upload-photo', authMiddleware_1.protect, uploadMiddleware_1.default.single('photo'), shiftController_1.uploadPhoto);
router.post('/open', authMiddleware_1.protect, shiftController_1.openShift);
router.put('/:id/live', authMiddleware_1.protect, uploadMiddleware_1.default.single('photo'), shiftController_1.goLiveShift);
router.put('/:id/close', authMiddleware_1.protect, uploadMiddleware_1.default.single('photo'), shiftController_1.closeShift);
exports.default = router;
//# sourceMappingURL=shiftRoutes.js.map