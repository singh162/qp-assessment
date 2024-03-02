import express from "express";
import { Router } from "express";
import adminApiRouter from "./router/grocery-admin-api";
import userApiRouter from "./router/grocery-user-api";

const router: Router = express.Router();

// For admin routes under /v1/admin
router.use("/v1/admin", adminApiRouter);

// For user routes under /v1/user
router.use("/v1/user", userApiRouter);

export default router;
