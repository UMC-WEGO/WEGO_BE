import { getUserProfile, getTravelCountByUserId, getCompletedMissionByUserId, getPastTripByUserId, getPostByUserId, getMissionByUserId, getMissionDetailByUserId, deletePastTrip, updateUserProfile } from "./user.repository.js";
import { getMissionDetailDto, getMissionDto, getUserPostDto, getUserProfileDto, PastTripsDto } from "./user.dto.js";

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

// 사용자 프로필 수정
export const updateUserProfileService = async (userId, nickname, email, profileImage) => {
  const affectedRows = await updateUserProfile(userId, nickname, email, profileImage);

  if (affectedRows === 0) {
    console.log("프로필 업데이트 실패");
    throw new Error("프로필 업데이트 실패");
  }

  return profileImage;
};

// 지난 여행 조회
export const getPastTripsService = async (userId) => {
  const trips = await getPastTripByUserId(userId);

  return PastTripsDto(trips);
};

// 지난 여행 일정 삭제
export const deletePastTripService = async (tripId) => {
  const trips = await deletePastTrip(tripId);

  return trips;
}

// 사용자 작성 게시글 조회
export const getUserPostService = async (userId) => {
  const posts = await getPostByUserId(userId);

  return getUserPostDto(posts);
};

// 저장한 미션 조회
export const getMissionService = async (userId) => {
  const missions= await getMissionByUserId(userId);
  return getMissionDto(missions);
};

// 미션 상세 조회
export const getMissionDetailService = async (userId, travelId, missionId) => {
  const missionDetail = await getMissionDetailByUserId(userId, travelId, missionId);
  return getMissionDetailDto(missionDetail);
};