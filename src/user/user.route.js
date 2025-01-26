import express from "express";
import authenticateToken from "../../config/jwt.middleware.js";
import { getPastTripsController, getUserInfoController, getUserPostController } from "./user.controller.js";

const router = express.Router();

// 사용자 프로필 조회
router.get("/info", authenticateToken, getUserInfoController);

// 지난 여행 조회
router.get("/past-trips", authenticateToken, getPastTripsController);

// 사용자 작성 게시글 조회
router.get("/my-posts", authenticateToken, getUserPostController);

export default router;