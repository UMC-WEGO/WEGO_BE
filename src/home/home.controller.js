import { StatusCodes } from "http-status-codes"
import { getRandomTrips, saveTripService } from "./home.service.js";
import { randomTripDto } from "./home.dto.js"

// 랜덤 여행지 추출
export const createRandomTrip = async (req, res) => {
  const { startDate, endDate, participant, departure, vehicle, duration } = req.body;

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