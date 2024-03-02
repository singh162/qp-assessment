"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const grocery_admin_api_1 = __importDefault(require("./router/grocery-admin-api"));
const grocery_user_api_1 = __importDefault(require("./router/grocery-user-api"));
const router = express_1.default.Router();
// For admin routes under /v1/admin
router.use("/v1/admin", grocery_admin_api_1.default);
// For user routes under /v1/user
router.use("/v1/user", grocery_user_api_1.default);
exports.default = router;
//# sourceMappingURL=route.js.map