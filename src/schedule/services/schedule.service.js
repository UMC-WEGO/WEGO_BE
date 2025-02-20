import {
    getAuthenticatedMissionsByTripId,
    insertMissionAuth,
    getCompletedMissionsByTripId,
    getTripById,
} from "../repositories/auth.repository.js";
import { mapAuthenticatedMission, mapMissionAuthResult } from "../dto/auth.dto.js";
import { getSpontaneousPostsByTripAndLocal } from "../repositories/auth.repository.js"; // 새로운 레포지토리 함수 가져오기
import { getTripSchedulesByUserId } from "../repositories/auth.repository.js";
import { getPastTripsByUserId } from "../repositories/auth.repository.js";
import { getTravelById } from "../repositories/auth.repository.js";
import { pool } from "../../../config/db.config.js";
import { updateTripParticipants } from "../repositories/auth.repository.js";

// 🛠 여행 인원수 업데이트
export const modifyTripParticipants = async (tripId, adultCount, childCount) => {
    if (adultCount < 0 || childCount < 0) {
        throw new Error("Invalid participant count");
    }

    try {
        const updated = await updateTripParticipants(tripId, adultCount, childCount);
        if (!updated) {
            throw new Error("Trip not found");
        }

        return { isSuccess: true, message: "여행 인원수가 성공적으로 수정되었습니다." };
    } catch (error) {
        throw new Error(`Error modifying trip participants: ${error.message}`);
    }
};


// 일정 수정 서비스
export const updateTripDatesService = async (tripId, startDate, endDate) => {
    const sql = `
        UPDATE travel 
        SET startDate = ?, endDate = ?, updated_at = NOW() 
        WHERE id = ?;
    `;

    try {
        const [result] = await pool.execute(sql, [startDate, endDate, tripId]);
        return result; // affectedRows 값 포함
    } catch (error) {
        throw new Error(`Failed to update trip dates: ${error.message}`);
    }
};


// 특정 여행 일정 조회 서비스
export const fetchTripById = async (tripId) => {
    try {
        const trip = await getTravelById(tripId);
        if (!trip) {
            throw new Error(`No trip found with ID: ${tripId}`);
        }
        return trip;
    } catch (error) {
        throw new Error(`Error fetching trip by ID: ${error.message}`);
    }
};




//지난 여행 목록 조회
export const fetchPastTripsByUserId = async (userId) => {
    try {
        return await getPastTripsByUserId(userId);
    } catch (error) {
        throw new Error(`Error fetching past trips: ${error.message}`);
    }
};


//여행 일정 목록 조회
export const fetchTripSchedulesByUserId = async (userId) => {
    try {
        return await getTripSchedulesByUserId(userId);
    } catch (error) {
        throw new Error(`Error fetching trip schedules: ${error.message}`);
    }
};

// 즉흥 게시글 조회 서비스
export const fetchSpontaneousPosts = async (tripId, local) => {
    try {
        const posts = await getSpontaneousPostsByTripAndLocal(tripId, local);

        if (posts.length === 0) {
            throw new Error(`No posts found for tripId: ${tripId} and local: ${local}`);
        }

        return posts;
    } catch (error) {
        throw new Error(`Failed to fetch spontaneous posts: ${error.message}`);
    }
};

// 현재 여행 일정 조회 서비스 
export const fetchCurrentTripSchedule = async (tripId) => {
    try {
        const travelData = await getTripById(tripId);
        if (!travelData) {
            throw new Error(`No travel schedule found for trip ID: ${tripId}`);
        }
        return travelData;
    } catch (error) {
        throw new Error(`Error fetching travel schedule: ${error.message}`);
    }
};



// 미션 인증 서비스
export const authenticateMissionService = async (tripId, missionId, userId, evidence) => {
    try {
        const id = await insertMissionAuth(tripId, missionId, userId, evidence);
        return mapMissionAuthResult({ id, tripId, missionId, userId, evidence });
    } catch (error) {
        throw new Error(`Service error: ${error.message}`);
    }
};

// 완료된 미션 조회 서비스
export const fetchCompletedMissions = async (tripId) => {
    try {
        const travelWithMissions = await getCompletedMissionsByTripId(tripId);
        if (!travelWithMissions) {
            throw new Error(`No completed missions found for trip ID: ${tripId}`);
        }
        return travelWithMissions;
    } catch (error) {
        throw new Error(`Error fetching completed missions with travel details: ${error.message}`);
    }
};


// 저장된 미션 조회 서비스 
export const fetchAuthenticatedMissions = async (tripId) => {
    try {
        const missions = await getAuthenticatedMissionsByTripId(tripId);

        if (missions.length === 0) {
            throw new Error(`No missions found for trip ID: ${tripId}`);
        }

        return missions.map(mapAuthenticatedMission);
    } catch (error) {
        throw new Error(`Service error: ${error.message}`);
    }
};
