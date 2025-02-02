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

// 방문 증감률 찾기
const getGrwowthRateByLocation = async (locationName) => {
  try {
    const query = `
      SELECT growth_rate
      FROM visit_growth_rate
      WHERE location_name = ?;
    `;

    const [rows] = await pool.query(query, [locationName]);

    if (rows.length > 0) {
      return rows[0].growth_rate;
    } else {
      return null;
    }
  } catch (error) {
    console.error("방문 증감률 조회 중 오류 발생", error);
    throw new Error("방문 증감률 정보를 가져오는 중 실패");
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
          const growthRate = await getGrwowthRateByLocation(dest);

          return {
            location: dest,
            region: region || "지역 정보 없음",
            growthRate: growthRate || "방문 증감률 정보 없음",
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

// 여행지 저장
export const saveTrip = async (location, adult_participants, child_participants, vehicle, duration, startDate, endDate, user_id) => {
  const query = `
    INSERT INTO travel (location, adult_participants, child_participants, vehicle, duration, startDate, endDate, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [location, adult_participants, child_participants, vehicle, duration, startDate, endDate, user_id];

  try {
    const [result] = await pool.query(query, values);
    return result.insertId; // 저장된 여행 일정 ID 반환
  } catch (error) {
    console.error('여행 일정 저장 중 오류 발생', error);
    throw new Error("여행 일정 저장 실패");
  }
}

// 다가오는 여행 일정 조회
export const getUpcomingTrips = async (user_id) => {
  
  const query =`
    SELECT id, location, startDate, endDate, adult_participants, child_participants, vehicle, duration
    FROM travel
    WHERE startDate >  NOW() AND user_id = ?
    ORDER BY startDate ASC
  `;

  try {
    const [rows] = await pool.query(query, [user_id]);
    console.log("다가오는 여행 조회", rows);
    return rows;
  } catch (error) {
    console.error("다가오는 여행 조회 중 오류 발생", error);
    throw new Error("다가오는 여행 조회 실패");
  }
};

// 여행 일정 삭제
export const deleteTrip = async (id) => {
  try {
    const query = `
      DELETE FROM travel WHERE id = ?;
    `;

    const [result] = await pool.query(query, [id]);

    // 삭제된 행 O -> 정상 / x -> 실패
    if (result.affectedRows > 0) {
      return true; // 성공
    } else {
      return false; // 해당 여행 존재 X -> 실패
    }
  } catch (error) {
    console.error("여행 삭제 중 오류 발생", error);
    throw new Error("여행 삭제 중 오류 발생");
  }
};

// 인기 미션 3개 조회
export const getTop3PopularMissions = async () => {
  const query = `
    SELECT
      m.id AS mission_id,
      m.title,
      m.content,
      m.point,
      m.imageUrl,
      COUNT(rm.user_id) AS user_count
    FROM receive_mission rm
    JOIN mission m ON rm.mission_id = m.id
    GROUP BY rm.mission_id
    ORDER BY user_count DESC
    LIMIT 3;
  `;

  try {
    const [rows] = await pool.execute(query);
    console.log("인기 미션 3개 레포지토리: ", rows);
    return rows;
  } catch (error) {
    throw new Error("인기 미션 3개 조회 중 레포지토리 오류");
  }
};

// 가장 임박한 여행 찾기
export const findClosestTravel = async (userId) => {
  const query = `
    SELECT id
    FROM travel
    WHERE user_id = ? AND startDate >= NOW()
    ORDER BY startDate ASC
    LIMIT 1;
  `;

  const [rows] = await pool.execute(query, [userId]);
  console.log ("가장 임박한 여행 id: ", rows);
  return rows.length ? rows[0].id : null;
};

// 중복 미션 저장 확인 함수
export const findMissionExists = async (userId, missionId, travelId) => {
  const query = `
    SELECT id
    FROM receive_mission
    WHERE user_id = ? AND mission_id = ? AND travel_id = ?
  `;

  const [rows] = await pool.execute(query, [userId, missionId, travelId]);
  console.log("중복 저장된 미션 id: ", rows);
  return rows.length > 0; // 중복된 미션 O -> true 반환
}

// 인기 미션 -> 내 미션 저장
export const savePopularMission = async (missionId, userId, travelId) => {

  const query = `
    INSERT INTO receive_mission (mission_id, user_id, travel_id, status)
    VALUES
    (?, ?, ?, false);
  `;

  const [result] = await pool.execute(query, [missionId, userId, travelId]);
    return result.insertId; // 저장된 여행 일정 ID 반환
};