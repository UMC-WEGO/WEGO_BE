import { pool } from "../../config/db.config.js";

// 부모 지역 찾기
const getRegionByLocation = async (locationName) => {
    try {
      const query = `
        SELECT region_name FROM local WHERE location_name = ?;
      `;

      const [rows] = await pool.query(query, [locationName]);
      return rows[0] ? rows[0].region_name : null; // 부모 지역 O -> 반환, 없으면 null
    } catch (error) {
      console.error('지역 조회 오류', error);
      throw new Error('지역 정보를 가져오는데 실패했습니다.');
    }
};

export const getFilterdRandomTrips = async (departure, vehicle, duration) => {
  try {
    const query = `
      SELECT * FROM trip
      WHERE departure = ? AND vehicle = ? AND duration = ?
      ORDER BY RAND() LIMIT 3;
    `;

    // 쿼리 로그 출력
    console.log(`Running query: ${query}`);
    console.log(`With params: ${departure}, ${vehicle}, ${duration}`);

    const [rows] = await pool.query(query, [departure, vehicle, duration]);

    console.log('location Query result:', JSON.stringify(rows, null, 2));  // 지역 추출 결과 확인

    // 각 여행지 부모 지역 조회
    const destinationsWithRegions = await Promise.all(
      rows.flatMap(async (trip) => {
      // 3가지 목적지 -> 배열 변환 (, 문자열 분리)
      const destinations = trip.destination.split(",").map((dest) => dest.trim());
      
      // 랜덤 3개 여행지 선택
      const randomDestinations = getRandomDestinations(destinations);

      // 각 목적지 부모 지역 조회
      return Promise.all(
        randomDestinations.map(async (dest) => {
          const region = await getRegionByLocation(dest);
          return {
            location: dest,
            region: region || "지역 정보 없음",
          };
        })
      );
    })
  );

    // 결과 로그 출력 (JSON.stringify 사용)
    console.log('region Query result:', JSON.stringify(destinationsWithRegions.flat(), null, 2));
    
    return destinationsWithRegions.flat();
    
  } catch (error) {
    console.error('Error executing query:', error);  // 에러 로그 출력
    throw new Error('랜덤 여행지를 추출하는 중 데이터베이스 오류')
  }
};

const getRandomDestinations = (destinations) => {
  // 배열을 섞고, 상위 3개만 반환
  const shuffled = destinations.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};
