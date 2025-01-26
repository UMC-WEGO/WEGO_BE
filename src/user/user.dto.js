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
          title: mission.missionTitle,
          imageUrl: mission.missionImageUrl,
          content: mission.missionContent,
          point: mission.missionPoint,
        },
        receivedMission: {
          id: mission.id,
          title: mission.missionTitle,
          content: mission.missionCotent,
          point: mission.missionPoint,
          status: Boolean(mission.status),
          createdAt: mission.created_at,
          updatedAt: mission.update_at,
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