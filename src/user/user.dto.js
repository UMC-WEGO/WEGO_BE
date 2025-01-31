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

// 지난 여행 조회
export const PastTripsDto = (trips) => {
  return {
    pastTrips: trips.map((trip) => ({
      tripId: trip.id,
      location: trip.location,
      participants: trip.participants,
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
          id: mission.id,
          content: mission.receivedMissionContent,
          status: Boolean(mission.receiveMissionStatus),
          createdAt: mission.receiveMissionCreatedAt,
          updatedAt: mission.receiveMissionUpdatedAt,
          imgUrl: mission.imgUrl,
        }
      })),
    })),
  };
};

// 사용자 작성 게시글 조회
export const getUserPostDto = (post, likeCount, scrapCount, commentCount) => {
  return {
    posts: post.map((post) => ({
      postId: post.id,
      categoryId: post.category_id,
      userId: post.user_id,
      localId: post.local_id,
      title: post.title,
      content: post.content,
      pictureUrl: post.picture_url,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
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