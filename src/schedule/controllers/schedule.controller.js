import {
    fetchSpontaneousPosts,
    fetchCurrentTripSchedule,
    authenticateMissionService,
    fetchCompletedMissions,
    fetchAuthenticatedMissions,
} from "../services/schedule.service.js";
import { fetchTripSchedulesByUserId } from "../services/schedule.service.js";
import { fetchPastTripsByUserId } from "../services/schedule.service.js";



//지난 여행 목록 조회
export const getPastTripsController = async (req, res) => {
    const { userId } = req.query; // `userId`를 쿼리 파라미터에서 추출
    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }

    try {
        const trips = await fetchPastTripsByUserId(userId);
        res.status(200).json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//여행 일정 목록 조회
export const getTripSchedulesController = async (req, res) => {
    const { userId } = req.query; // `userId`를 쿼리 파라미터에서 추출
    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }

    try {
        const trips = await fetchTripSchedulesByUserId(userId);
        res.status(200).json({ success: true, data: trips });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 즉흥 게시글 조회 컨트롤러
export const getSpontaneousPosts = async (req, res) => {
    const { tripId, local } = req.params;
    try {
        const posts = await fetchSpontaneousPosts(tripId, local);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 현재 여행 일정 조회 컨트롤러
export const getCurrentTripSchedule = async (req, res) => {
    const { tripId } = req.params;
    try {
        const trip = await fetchCurrentTripSchedule(tripId);
        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// 미션 인증 컨트롤러
export const authenticateMission = async (req, res) => {
    const { tripId, missionId } = req.params;
    const { userId, evidence } = req.body;
    try {
        const result = await authenticateMissionService(tripId, missionId, userId, evidence);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 완료된 미션 조회 컨트롤러
export const getCompletedMissions = async (req, res) => {
    const { tripId } = req.params;
    try {
        const missions = await fetchCompletedMissions(tripId);
        res.status(200).json({ success: true, data: missions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 저장된 미션 조회 컨트롤러
export const getAuthenticatedMissions = async (req, res) => {
    const { tripId } = req.params;
    try {
        const missions = await fetchAuthenticatedMissions(tripId);
        res.status(200).json({ success: true, data: missions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

