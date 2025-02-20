import {
    fetchSpontaneousPosts,
    fetchCurrentTripSchedule,
    authenticateMissionService,
    fetchCompletedMissions,
    fetchAuthenticatedMissions,
} from "../services/schedule.service.js";
import { fetchTripSchedulesByUserId } from "../services/schedule.service.js";
import { fetchPastTripsByUserId } from "../services/schedule.service.js";
import { fetchTripById } from "../services/schedule.service.js";
import { updateTripDatesService } from "../services/schedule.service.js";
import { modifyTripParticipants } from "../services/schedule.service.js";

// 🛠 여행 인원수 업데이트
export const updateTripParticipants = async (req, res) => {
    const { tripId } = req.params;
    const { adultCount, childCount } = req.body;

    if (adultCount === undefined || childCount === undefined) {
        return res.status(400).json({ isSuccess: false, code: 400, message: "유효하지 않은 요청입니다." });
    }

    try {
        const response = await modifyTripParticipants(tripId, adultCount, childCount);
        res.status(200).json({ isSuccess: true, code: 200, message: response.message });
    } catch (error) {
        if (error.message === "Trip not found") {
            return res.status(404).json({ isSuccess: false, code: 404, message: "해당 여행 일정이 존재하지 않습니다." });
        }
        res.status(500).json({ isSuccess: false, code: 500, message: `Error updating trip participants: ${error.message}` });
    }
};


// 일정 수정

export const updateTripScheduleDates = async (req, res) => {
    const { tripId } = req.params;
    let { startDate, endDate } = req.body;

    try {
        // 1️⃣ 날짜 값이 유효한지 검증 (ISO 8601 형식 체크)
        if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return res.status(400).json({
                isSuccess: false,
                code: 400,
                message: "유효하지 않은 날짜입니다.",
            });
        }

        // 2️⃣ 날짜 변환 (ISO 8601 → MySQL DATETIME 형식)
        startDate = new Date(startDate).toISOString().slice(0, 19).replace("T", " ");
        endDate = new Date(endDate).toISOString().slice(0, 19).replace("T", " ");

        // 3️⃣ 서비스 호출하여 업데이트 수행
        const result = await updateTripDatesService(tripId, startDate, endDate);

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                isSuccess: false,
                code: 404,
                message: "해당 여행 일정이 존재하지 않습니다.",
            });
        }

        // 4️⃣ 성공 응답
        res.status(200).json({
            isSuccess: true,
            code: 200,
            message: "여행 일정이 성공적으로 수정되었습니다.",
        });

    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            code: 500,
            message: `Error updating trip dates: ${error.message}`,
        });
    }
};



// 특정 여행 일정 조회 컨트롤러
export const getTripSchedule = async (req, res) => {
    const { tripId } = req.params;

    try {
        const trip = await fetchTripById(tripId);
        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

//지난 여행 목록 조회
export const getPastTripsController = async (req, res) => {
    const { userId } = req.query; // `userId`를 쿼리 파라미터에서 추출
    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }

    try {
        const trips = await fetchPastTripsByUserId(userId);
        res.status(200).json({ success: true, data: trips, message:"지난 여행 목록이 성공적으로 조회되었습니다." });
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

