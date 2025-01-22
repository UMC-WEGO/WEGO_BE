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
        return await getTripById(tripId);
    } catch (error) {
        throw new Error(`Error fetching trip schedule: ${error.message}`);
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
        return await getCompletedMissionsByTripId(tripId);
    } catch (error) {
        throw new Error(`Error fetching completed missions: ${error.message}`);
    }
};

// 저장된 미션 조회 서비스
export const fetchAuthenticatedMissions = async (tripId) => {
    try {
        const missions = await getAuthenticatedMissionsByTripId(tripId);
        return missions.map(mapAuthenticatedMission);
    } catch (error) {
        throw new Error(`Service error: ${error.message}`);
    }
};
