export const getUserProfileDto = (userProfile, travelCount, completedMission) => {
  return {
    user_id: userProfile.id,
    email: userProfile.email,
    nickname: userProfile.nickname,
    profile_image: userProfile.profile_image,
    point: userProfile.point,
    temperature: userProfile.temp,
    travelCount: travelCount,
    completedMission: completedMission,
  };
};