import express from "express";
import authenticateToken from "../../config/jwt.middleware.js";
import { deletePastTripController, getMissionController, getMissionDetailController, getPastTripsController, getUserInfoController, getUserPostController, updateUserProfileController } from "./user.controller.js";
import { upload } from "../../config/s3.js";

const router = express.Router();

// 사용자 프로필 조회
router.get("/info", authenticateToken, getUserInfoController);

// 사용자 프로필 수정
router.patch("/profile", authenticateToken, upload.single("profile_image"), updateUserProfileController);

// 지난 여행 조회
router.get("/past-trips", authenticateToken, getPastTripsController);

// 지난 여행 일정 삭제
router.delete("/past-trips/:tripId", authenticateToken, deletePastTripController);

// 사용자 작성 게시글 조회
router.get("/my-posts", authenticateToken, getUserPostController);

// 저장한 미션 조회
router.get("/my-missions", authenticateToken, getMissionController);

// 미션 상세 조회
router.get("/past-trips/:tripId/:missionId", authenticateToken, getMissionDetailController);

export default router;