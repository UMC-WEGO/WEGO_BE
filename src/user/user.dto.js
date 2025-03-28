import moment from "moment-timezone";

// 사용자 프로필 조회
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

// 사용자 프로필 수정
export const updateProfileDto = (nickname, email, profileImage) => {
  return {
    nickname: nickname,
    email: email,
    profileImage: profileImage,
  };
};

// 지난 여행 조회
export const PastTripsDto = (trips) => {
  return {
    pastTrips: trips.map((trip) => ({
      tripId: trip.id,
      location: trip.location,
      adult_participants: trip.adult_participants,
      child_participants: trip.child_participants,
      vehicle: trip.vehicle,
      startDate: moment.tz(trip.startDate, "Asia/Seoul").format(),
      endDate: moment.tz(trip.endDate, "Asia/Seoul").format(),
      missions: trip.missions.map((mission) => ({
        mission: {
          id: mission.id,
          title: mission.missionTitle,
          imageUrl: mission.missionImageUrl,
          content: mission.missionContent,
          point: mission.missionPoint,
        },
        receivedMission: {
          id: mission.receiveMissionId,
          content: mission.receiveMissionContent,
          picture: mission.receiveMissionPicture,
          status: Boolean(mission.receiveMissionStatus),
          createdAt: mission.receiveMissionCreatedAt,
          updatedAt: mission.receiveMissionUpdatedAt,
        }
      })),
    })),
  };
};

// 사용자 작성 게시글 조회
export const getUserPostDto = (post, likeCount, scrapCount, commentCount) => {
  return {
    posts: post.map((post) => ({
      postId: post.postId,
      categoryId: post.categoryId,
      categoryName: post.categoryName,
      userId: post.userId,
      localId: post.localId,
      locationName: post.locationName,
      title: post.title,
      content: post.content,
      pictureUrl: post.pictureUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post.likeCount,
      scarpCount: post.scrapCount,
      commentCount: post.commentCount,
    })),
  };
};

// 저장한 미션 조회
export const getMissionDto = (receiveMission) => {
  return {
    missions: receiveMission.map((mission) => ({
      tripId: mission.travel_id,
      missionId: mission.mission_id,
      imageUrl: mission.imageUrl,
      title: mission.title,
      content: mission.content,
      point: mission.point,
    })),
  };
};

// 미션 상세 조회
export const getMissionDetailDto = (receiveMission) => {
  if (!receiveMission || receiveMission.length === 0) {
    return null; // 미션이 없는 경우 null 반환
  }

  const mission = receiveMission[0]; // 첫 번째 요소 사용

  return {
    tripId: mission.travel_id,
    mission_id: mission.mission_id,
    receive_mission_id: mission.receive_mission_id,
    content: mission.content,
    picture: mission.picture,
    status: Boolean(mission.status),
    createdAt: mission.created_at,
    updatedAt: mission.updated_at,
    imgUrl: mission.imgUrl,
  };
};