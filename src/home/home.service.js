import { getFilterdRandomTrips } from "./home.repository.js"
import { response } from '../../config/response.js';

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
