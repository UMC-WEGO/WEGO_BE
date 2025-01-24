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
  const query = `
    SELECT *
    FROM travel
    WHERE user_id = ? AND endDate < NOW();
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows;
};
