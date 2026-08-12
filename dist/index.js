"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Ensure uploads folder exists
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static uploaded photos
app.use('/uploads', express_1.default.static(uploadsDir));
// Connect Database
(0, db_1.default)();
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const shiftRoutes_1 = __importDefault(require("./routes/shiftRoutes"));
const stockRoutes_1 = __importDefault(require("./routes/stockRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const foodItemRoutes_1 = __importDefault(require("./routes/foodItemRoutes"));
const saleRoutes_1 = __importDefault(require("./routes/saleRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const alertRoutes_1 = __importDefault(require("./routes/alertRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/items', itemRoutes_1.default);
app.use('/api/shifts', shiftRoutes_1.default);
app.use('/api/stock', stockRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/fooditems', foodItemRoutes_1.default);
app.use('/api/recipes', foodItemRoutes_1.default);
app.use('/api/sales', saleRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/alerts', alertRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.get('/', (req, res) => {
    res.send('BellyBites Cart API is running...');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map