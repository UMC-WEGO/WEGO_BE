import { getUserProfile, getTravelCountByUserId, getCompletedMissionByUserId, getPastTripByUserId, getPostByUserId } from "./user.repository.js";
import { getUserPostDto, getUserProfileDto, PastTripsDto } from "./user.dto.js";

//  사용자 프로필 조회
export const getUserProfileService = async (userId) => {
  
  // 프로필 조회
  const userProfile = await getUserProfile(userId);
  if (!userProfile) return null;

  // 여행 기록 개수 조회
  const travelCount = await getTravelCountByUserId(userId);

  // 미션 달성 개수 조회
  const completedMission = await getCompletedMissionByUserId(userId);

  // DTO로 변환
  return getUserProfileDto(userProfile, travelCount, completedMission);
};

// 지난 여행 조회
export const getPastTripsService = async (userId) => {
  const trips = await getPastTripByUserId(userId);

  return PastTripsDto(trips);
};

// 사용자 작성 게시글 조회
export const getUserPostService = async (userId) => {
  const posts = await getPostByUserId(userId);

  return getUserPostDto(posts);
};