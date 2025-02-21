import moment from "moment-timezone";

// 랜덤 여행지 추출
export const randomTripDto = (data) => {
  return {
    departure: data.departure,
    adult_participants: data.adult_participants,
    child_participants: data.child_participants,
    vehicle: data.vehicle,
    duration: data.duration,
    startDate: data.startDate,
    endDate: data.endDate,
    growthRate: data.growthRate,
  };
};

// 여행 일정 등록
export const saveTripDto = (data) => {
  console.log("요청 데이터: ", data);
  console.log("여행 어른 인원수: ", data.adult_participants);
  console.log("여행 아이 인원수: ", data.child_participants);

  // 숫자인지 확인 -> 유효성 검사
  const adult_participants = Number(data.adult_participants);
  const child_participants = Number(data.child_participants);
  const participants = adult_participants + child_participants;

  if (isNaN(participants) || participants <= 0) {
    throw new Error('참가자 수는 1 이상의 값이여야 합니다.');
  }

  const saveTripDto = {
    location: data.location,
    adult_participants: data.adult_participants,
    child_participants: data.child_participants,
    vehicle: data.vehicle,
    duration: data.duration,
    startDate: data.startDate,
    endDate: data.endDate,
    // user_id: data.user_id,
  };

  if (isNaN(new Date(saveTripDto.startDate).getTime() || isNaN(new Date(saveTripDto.endDate).getTime()))) {
    throw new Error('유효한 날짜를 입력해주세요.');
  }

  return saveTripDto;
}

// 다가오는 여행 일정 조회 (클라이언트에 반환할 데이터 정의)
export const upcomingTripDto = (trip) => ({
  tripId: trip.id,
  location: trip.location,
  adult_participants: trip.adult_participants,
  child_participants: trip.child_participants,
  vehicle: trip.vehicle,
  duration: trip.duration,
  startDate: moment.tz(trip.startDate, "Asia/Seoul").format(),
  endDate: moment.tz(trip.endDate, "Asia/Seoul").format(),
});

// 여행 일정 삭제
export const deleteTripDto = (tripId) => {
  return {
    tripId,
  };
};

// 인기 미션 3개 조회
export const popularMissionDto = (missions) => {
  if (!Array.isArray(missions)) {
    throw new Error("Missions is not an array");
  }

  console.log("매핑할 미션: ", missions);
  
  return {
    missions: missions.map((mission) => ({
      missionId: mission.mission_id,
      title: mission.title,
      content: mission.content,
      point: mission.point,
      imageUrl: mission.imageUrl,
      userCount: mission.user_count,
      exists_mission: mission.exists_mission
    })),
  };
}
