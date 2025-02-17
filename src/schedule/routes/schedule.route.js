import express from "express";
import {
    getSpontaneousPosts,
    getCurrentTripSchedule,
    authenticateMission,
    getCompletedMissions,
    getAuthenticatedMissions,
} from "../controllers/schedule.controller.js";
import { getTripSchedulesController, getPastTripsController } from "../controllers/schedule.controller.js";
import { getTripSchedule } from "../controllers/schedule.controller.js";
import { updateTripScheduleDates } from "../controllers/schedule.controller.js";
import { updateTripParticipants } from "../controllers/schedule.controller.js";


const router = express.Router();

// 즉흥 게시글 조회
router.get("/trip-schedules/:tripId/spontaneous-posts/:local", getSpontaneousPosts);

// 현재 여행 일정 조회
router.get("/trip-schedules/:tripId/current", getCurrentTripSchedule);

// 미션 인증
router.post("/trip-schedules/:tripId/missions/:missionId/auth", authenticateMission);

// 완료된 미션 조회
router.get("/trip-schedules/:tripId/status/completed", getCompletedMissions);

// 저장된 미션 조회
router.get("/trip-schedules/:tripId/missions/auth", getAuthenticatedMissions);

// 현재 여행 일정 목록 조회
router.get("/trip-schedules", getTripSchedulesController);

// 지난 여행 목록 조회
router.get("/past-trips", getPastTripsController);

// 특정 여행 일정 조회 API
router.get("/trip-schedules/:tripId", getTripSchedule);

// 여행 날짜 수정
router.put("/trip-schedules/:tripId/dates", updateTripScheduleDates);

// 여행 인원수 수정 (PUT)
router.put("/trip-schedules/:tripId/participants", updateTripParticipants);


// 테스트 라우트
router.get("/test", (req, res) => {
    console.log("Test route hit!");
    res.send("Test route works!");
});

export default router;
