import { pool } from "../../config/db.config.js";

// 사용자 프로필 조회
export const getUserProfile = async (userId) => {
  const query = `
    SELECT id, email, nickname, profile_image, point, temp
    FROM User
    WHERE id = ? AND status = 'ACTIVE';
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// 지난 여행 일정 개수 조회
export const getTravelCountByUserId = async (userId) => {
  const query =`
    SELECT COUNT(*) AS travelCount
    FROM travel
    WHERE user_id = ? AND endDate < NOW();
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0].travelCount;
};

export const getCompletedMissionByUserId = async (userId) => {
  const query =`
    SELECT COUNT(*) AS completedMission
    FROM receive_mission
    WHERE user_id = ? AND status = true;
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0].completedMission;
};

// 지난 여행 조회
export const getPastTripByUserId = async (userId) => {
  const tripsQuery = `
    SELECT *
    FROM travel
    WHERE user_id = ? AND endDate < NOW();
  `;

  const [trips] = await pool.execute(tripsQuery, [userId]);

  // 여행별 미션 정보 조회
  const missionsQuery = `
    SELECT
    rm.id AS receiveMissionId,
    rm.content AS receivedMissionContent,
    rm.status AS receiveMissionStatus,
    rm.created_at AS receiveMissionCreatedAt,
    rm.updated_at AS receiveMissionUpdatedAt,
    m.title AS missionTitle,
    m.imageUrl AS missionImageUrl,
    m.content AS missionContent,
    m.point AS missionPoint
    FROM receive_mission rm
    INNER JOIN mission m ON rm.mission_id = m.id
    WHERE rm.travel_id = ?;
  `;

  for (const trip of trips) {
    const [missions] = await pool.execute(missionsQuery, [trip.id]);
    trip.missions = missions;
  }

  return trips;
};

// 사용자 작성 게시글 조회
export const getPostByUserId = async (userId) => {
  const postQuery = `
    SELECT
      p.*,
      (SELECT COUNT(*) FROM \`Like\` l WHERE l.post_id = p.id) AS likeCount,
      (SELECT COUNT(*) FROM scrap s WHERE s.post_id = p.id) AS scrapCount,
      (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.id) AS commentCount
    FROM post p
    WHERE p.user_id = ?;
  `;

  
  const [rows] = await pool.execute(postQuery, [userId]);
  // console.log("사용자 게시글 조회 repository", rows);
  
  return rows;
};