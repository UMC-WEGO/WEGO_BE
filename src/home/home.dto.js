export const randomTripDto = (data) => {
  return {
    tripDates: data.travelDates,
    numberOfPeople: data.numberOfPeople,
    depatrue: data.depature,
    vehicle: data.vehicle,
    duration: data.duration,
  };
};

// 여행 일정 등록
export const saveTripDto = (data) => {
  console.log("요청 데이터: ", data);
  console.log("여행 인원수: ", data.participants);

  // 숫자인지 확인 -> 유효성 검사
  const participants = Number(data.participants);

  if (isNaN(participants) || participants <= 0) {
    throw new Error('참가자 수는 1 이상의 값이여야 합니다.');
  }

  const saveTripDto = {
    location: data.location,
    participants: participants,
    vehicle: data.vehicle,
    duration: data.duration,
    startDate: data.startDate,
    endDate: data.endDate,
    user_id: data.user_id,
  };

  if (isNaN(new Date(saveTripDto.startDate).getTime() || isNaN(new Date(saveTripDto.endDate).getTime()))) {
    throw new Error('유효한 날짜를 입력해주세요.');
  }

  return saveTripDto;
}