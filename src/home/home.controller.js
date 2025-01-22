import { StatusCodes } from "http-status-codes"
import { deleteTripService, getRandomTrips, getUpcomingTripsService, saveTripService } from "./home.service.js";
import { randomTripDto } from "./home.dto.js"
import { deleteTrip } from "./home.repository.js";

// 랜덤 여행지 추출
export const createRandomTrip = async (req, res) => {
  const { startDate, endDate, participants, departure, vehicle, duration } = req.body;

  // 서비스 호출 -> 랜덤 여행지 3곳
  const result = await getRandomTrips(departure, vehicle, duration);

  // 응답
  res.status(result.code).json(result);
};

// 여행 일정 저장
export const saveTripController = async (req, res) => {
  const { location, participants, vehicle, duration, startDate, endDate, user_id } = req.body;

  try {
    // 서비스로 데이터 전달
    const result = await saveTripService({
      location,
      participants,
      vehicle,
      duration,
      startDate,
      endDate,
      user_id
    });

    res.status(result.code).json(result);
  } catch (error) {
    console.error("saveTripController 오류", error);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "서버 오류 발생"
    });
  }
};

// 다가오는 여행 조회
export const getUpcomingTripsController = async (req, res) => {
  const { userId } = req.query;

  console.log("userId:", userId);

  if (!userId) {
    return res.status(400).json({
      isSuccess: false,
      code: 400,
      message: "memberId가 필요합니다.",
    });
  }

  try {
    const result = await getUpcomingTripsService(userId);
    res.status(result.code).json(result);
  } catch (error) {
    console.error("다가오는 여행 조회 중 컨트롤러 오류", error);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "다가오는 여행 조회 중 서버 오류 발생"
    });
  }
};

// 다가오는 여행 일정 삭제
export const deleteUpcomingTrip = async (req, res) => {
  const { tripId } = req.params;

  // 서비스 호출 -> 여행 일정 삭제
  const result = await deleteTripService(tripId);

  // 응답
  res.status(result.code).json({
    isSuccess: result.isSuccess,
    code: result.code,
    message: result.message,
  });

}