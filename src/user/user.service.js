import { getUserProfile, getTravelCountByUserId, getCompletedMissionByUserId } from "./user.repository.js";
import { getUserProfileDto } from "./user.dto.js";

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