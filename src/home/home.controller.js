import { StatusCodes } from "http-status-codes"
import { getRandomTrips } from "./home.service.js";
import { randomTripDto } from "./home.dto.js"

// 랜덤 여행지 추출
export const createRandomTrip = async (req, res) => {
  const { startDate, endDate, participant, departure, vehicle, duration } = req.body;

  // 서비스 호출 -> 랜덤 여행지 3곳
  const result = await getRandomTrips(departure, vehicle, duration);

  // 응답
  res.status(result.code).json(result);
};