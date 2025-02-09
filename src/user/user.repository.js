import { pool } from "../../config/db.config.js";

// 사용자 프로필 조회
export const getUserProfile = async (userId) => {
  const query = `
    SELECT id, email, nickname, profile_image, COALESCE(point, 0) AS point, temp
    FROM User
    WHERE id = ? AND status = 'ACTIVE';
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows[0];
};

// 사용자 프로필 수정
export const updateUserProfile = async (userId, nickname, email, profileImage) => {
  let query = `UPDATE User SET `;
  const values = [];
  const updates = [];

  if (nickname !== undefined) {
    updates.push(`nickname = ?`);
    values.push(nickname);
  }

  if (email !== undefined) {
    updates.push(`email = ?`);
    values.push(email);
  }

  if (profileImage !== undefined) {
    updates.push(`profile_image = ?`);
    values.push(profileImage);
  }

  if (updates.length === 0) {
    throw new Error("업데이트할 값이 없습니다.");
  }

  query += updates.join(", ");
  query += ` WHERE id = ?`;
  values.push(userId);

  const [result] = await pool.execute(query, values);
  return result.affectedRows;
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
      m.id,
      m.title AS missionTitle,
      m.imageUrl AS missionImageUrl,
      m.content AS missionContent,
      m.point AS missionPoint,
      mp.imgUrl
    FROM receive_mission rm
    INNER JOIN mission m ON rm.mission_id = m.id
    LEFT JOIN mission_pic mp ON rm.id = mp.receive_mission_id
    WHERE
      rm.travel_id = ?;
  `;

  for (const trip of trips) {
    const [missions] = await pool.execute(missionsQuery, [trip.id]);
    trip.missions = missions;
  }

  return trips;
};

// 지난 여행 삭제
export const deletePastTrip = async (travelId) => {
  try {
    const query = `
      DELETE FROM travel WHERE id = ? AND endDate < NOW();
    `;

    const [result] = await pool.execute(query, [travelId]);

    // 삭제된 행 O -> 성공 / x -> 실패
    if (result.affectedRows > 0) {
      return true; // 성공
    } else {
      return false;
    }
  } catch (error) {
    console.error("지난 여행 삭제 중 오류 발생", error);
    throw new Error("지난 여행 삭제 중 오류 발생");
  }
};

// 사용자 작성 게시글 조회
export const getPostByUserId = async (userId) => {
  const postQuery = `
    SELECT
      p.*,
      (SELECT COUNT(*) FROM \`Like\` l WHERE l.post_id = p.id) AS likeCount,
      (SELECT COUNT(*) FROM scrap s WHERE s.post_id = p.id) AS scrapCount,
      (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.id) AS commentCount
    FROM Post p
    WHERE p.user_id = ?;
  `;

  
  const [rows] = await pool.execute(postQuery, [userId]);
  // console.log("사용자 게시글 조회 repository", rows);
  
  return rows;
};

// 저장한 미션 조회
export const getMissionByUserId = async (userId) => {
  const missionQuery = `
    SELECT
    rm.travel_id,
    m.id AS mission_id,
    m.imageUrl,
    m.title,
    m.content AS mission_content,
    m.point
    FROM receive_mission rm
    JOIN mission m ON rm.mission_id = m.id
    WHERE rm.user_id = ?;
  `;

  console.log("저장된 미션 쿼리문: ", missionQuery);
  const [rows]  = await pool.execute(missionQuery, [userId])
  
  return rows;
}

// 미션 상세 조회
export const getMissionDetailByUserId = async (userId, travelId, missionId) => {
  const query = `
    SELECT
      m.id AS mission_id,
      rm.id AS receive_mission_id,
      rm.travel_id AS travel_id,
      rm.content,
      rm.picture,
      rm.status,
      rm.created_at,
      rm.updated_at,
      mp.imgUrl
    FROM receive_mission rm
    JOIN mission m ON rm.mission_id = m.id
    LEFT JOIN mission_pic mp ON rm.id = mp.receive_mission_id
    WHERE rm.user_id = ?
      AND rm.travel_id = ?
      AND rm.mission_id = ?;
  `;

  const [rows] = await pool.execute(query, [userId, travelId, missionId]);
  console.log("미션 상세 조회:", rows);
  return rows;
}