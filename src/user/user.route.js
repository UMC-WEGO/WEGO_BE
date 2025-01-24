import express from "express";
import authenticateToken from "../../config/jwt.middleware.js";
import { getUserInfoController } from "./user.controller.js";

const router = express.Router();

// 사용자 프로필 조회
router.get("/info", authenticateToken, getUserInfoController);

export default router;