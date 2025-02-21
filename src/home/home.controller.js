import { StatusCodes } from "http-status-codes"
import { deleteTripService, getRandomTrips, getTop3PopularMissionService, getUpcomingTripsService, savePopularMissionService, saveTripService } from "./home.service.js";
import { randomTripDto } from "./home.dto.js"
import { deleteTrip } from "./home.repository.js";

// 랜덤 여행지 추출
export const createRandomTrip = async (req, res) => {
  const { startDate, endDate, adult_participants, child_participants, departure, vehicle, duration } = req.body;

  // 요청 값 검증
  const validVehicles = ["자가용", "버스", "기차(KTX)"];
  const validDurations = ["1", "1-2", "2-3", "3+"];

  if (!validVehicles.includes(vehicle) || !validDurations.includes(duration)) {
    return res.status(400).json({
      isSuccess: false,
      code: 400,
      message: "유효하지 않은 vehicle 또는 duration 값입니다.",
      result: [],
    });
  }
  
  // 서비스 호출 -> 랜덤 여행지 3곳
  const result = await getRandomTrips(departure, vehicle, duration);

  // 응답
  res.status(result.code).json(result);
};

// 여행 일정 저장
export const saveTripController = async (req, res) => {
  const user_id = req.user_id;
  const { location, adult_participants, child_participants, vehicle, duration, startDate, endDate} = req.body;

  console.log("userId:", user_id);

  try {
    // 서비스로 데이터 전달
    const result = await saveTripService({
      location,
      adult_participants,
      child_participants,
      vehicle,
      duration,
      startDate,
      endDate,
    }, user_id);

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
  const user_id = req.user_id;

  console.log("userId:", user_id);

  if (!user_id) {
    return res.status(400).json({
      isSuccess: false,
      code: 400,
      message: "user_id가 필요합니다.",
    });
  }

  try {
    const result = await getUpcomingTripsService(user_id);
    console.log("다가오는 여행 조회 controller: ", result);
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

  try {
    res.status(result.code).json(result);
  } catch (error) {
    console.error("다가오는 여행 삭제 중 컨트롤러 오류", error);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "다가오는 여행 삭제 중 서버 오류 발생"
    });
  }
}

// 인기 미션 3개 조회
export const getPopularMissionController = async (req, res) => {
  
  try {
    const user_id = req.user_id;

    const result = await getTop3PopularMissionService(user_id);
    console.log("서비스에서 받은 인기 미션: ", result);
    res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "인기 미션 3개 조회 성공",
      result: result
    });
  } catch (error) {
    console.log("인기 미션 3개 조회 중 컨트롤러 오류: ", error.message);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "인기 미션 3개 조회 중 서버 오류 발생"
    });
  }
}

// 미션 저장 -> 내 미션 저장
export const savePopularMissionController = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { missionId } = req.params;

    if (!missionId) {
      return res.status(400).json({
        isSuccess: false,
        code: 400,
        message: "mission_id가 필요합니다.",
      });
    }

    const result = await savePopularMissionService(user_id, missionId);

    return res.status(200).json(result);

  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "인기 미션 저장 중 서버 오류 발생"
    });
  }
};