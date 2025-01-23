import { deleteTrip, getFilterdRandomTrips, getUpcomingTrips, saveTrip } from "./home.repository.js"
import { response } from '../../config/response.js';
import { saveTripDto, upcomingTripDto } from "./home.dto.js";

export const getRandomTrips = async (departure, vehicle, duration) => {
  try {
    // 조건에 맞는 도착지 목록 repository에서 가져옴
    const destinations = await getFilterdRandomTrips(departure, vehicle, duration);

    // 데이터 X -> 빈 배열
    if (destinations.length === 0) {
      return response({
        isSuccess: false,
        code: 404,
        message: '조건에 맞는 여행지가 없습니다.',
      }, []);
    }

    console.log("최종 3가지 여행지", destinations);

    return response({
      isSuccess: true,
      code: 200,
      message: '랜덤 여행지 3개가 추출되었습니다.',
    }, destinations);
  } catch (error) {
    return response({
      isSuccess: false,
      code: 500,
      message: '여행지 추출 중 오류가 발생했습니다.',
    }, []);
  }
};

// 여행지 저장
export const saveTripService = async (data) => {
  const tripDto = saveTripDto(data);

  try {
    // 여행 일정 repository를 통해 저장
    const tripId = await saveTrip(
      tripDto.location,
      tripDto.participants,
      tripDto.vehicle,
      tripDto.duration,
      tripDto.startDate,
      tripDto.endDate,
      tripDto.user_id
    );

    return response({
      isSuccess: true,
      code: 200,
      message: '여행 일정이 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    return response({
      isSuccess: false,
      code: 500,
      message: '여행 일정 저장 중 오류가 발생하였습니다.',
    });
  }
};

// 다가오는 여행 일정 조회
export const getUpcomingTripsService = async (memberId) => {
  try {
    const trips = await getUpcomingTrips(memberId);

    if (trips.length === 0) {
      return {
        isSuccess: true,
        code: 200,
        message: "다가오는 여행이 없습니다.",
        result: [],
      };
    }
    
    // DTO 변환
    const result = trips.map(upcomingTripDto);

    return {
      isSuccess: true,
      code: 200,
      message: "다가오는 여행 조회 성공",
      result,
    };
  } catch (error) {
    console.error("다가오는 여행 조회 중 서비스 오류", error);

    return {
      isSuccess: false,
      code: 500,
      message: "다가오는 여행 조회 중 오류 발생",
    };
  }
};

// 여행 일정 삭제
export const deleteTripService = async (tripId) => {
  try {
    const success = await deleteTrip(tripId);

    if (success) {
      return response({
        isSuccess: true,
        code: 200,
        message: "여행 일정이 성공적으로 삭제되었습니다.",
      });
    } else {
      return response({
        isSuccess: false,
        code: 404,
        messsage: "해당 여행 일정이 존재하지 않습니다.",
      });
    }
  } catch (error) {
    console.error("여행 삭제 중 서비스 오류", error);
    return response({
      isSuccess: false,
      code: 500,
      message: "여행 일정 삭제 중 서버 오류 발생",
    });
  }
};