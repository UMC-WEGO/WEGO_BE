import { pool } from "../../../config/db.config.js";

// 특정 여행 ID로 저장된 미션 조회
export const getAuthenticatedMissionsByTripId = async (tripId) => {
    const sql = `
    SELECT 
        p.id AS postId,
        p.title,
        p.content,
        p.picture_url AS pictureUrl,
        p.created_at AS createdAt,
        c.name AS categoryName,
        u.nickname AS author
    FROM 
        Post p
    INNER JOIN category c ON p.category_id = c.id
    INNER JOIN User u ON p.user_id = u.id
    INNER JOIN local l ON p.local_id = l.id
    WHERE 
        l.location_name = ? AND p.status = 'ACTIVE';
`;


    try {
        const [missions] = await pool.execute(sql, [tripId]);
        return missions;
    } catch (error) {
        throw new Error(`Failed to fetch authenticated missions: ${error.message}`);
    }
};

// 미션 인증 추가
export const insertMissionAuth = async (missionId, userId, content, picture) => {
    const sql = `
        UPDATE receive_mission 
        SET status = TRUE, content = ?, picture = ?, updated_at = NOW()
        WHERE mission_id = ? AND user_id = ?;
    `;

    try {
        const [result] = await pool.execute(sql, [content, picture, missionId, userId]);
        return result.affectedRows > 0; // 성공 여부 반환
    } catch (error) {
        throw new Error(`Failed to update mission authentication: ${error.message}`);
    }
};


// 완료된 미션 조회
export const getCompletedMissionsByTripId = async (tripId) => {
    const sql = `
        SELECT 
            m.id, 
            m.title, 
            m.content, 
            m.point
        FROM 
            mission m
        JOIN 
            receive_mission rm ON m.id = rm.mission_id
        WHERE 
            rm.status = TRUE AND rm.user_id = ?;
    `;

    try {
        const [missions] = await pool.execute(sql, [tripId]);
        return missions;
    } catch (error) {
        throw new Error(`Failed to fetch completed missions: ${error.message}`);
    }
};

// 여행 ID로 여행 정보 가져오기
export const getTripById = async (tripId) => {
    const sql = `
        SELECT id, departure, vehicle, duration, destination
        FROM trip
        WHERE id = ?;
    `;
    try {
        const [result] = await pool.execute(sql, [tripId]);
        return result[0];
    } catch (error) {
        throw new Error(`Failed to fetch trip: ${error.message}`);
    }
};

// 특정 여행 ID와 지역으로 즉흥 게시글 조회
export const getSpontaneousPostsByTripAndLocal = async (tripId, local) => {
    const sql = `
        SELECT 
            p.id AS postId,
            p.title,
            p.content,
            p.picture_url AS pictureUrl,
            p.created_at AS createdAt,
            c.name AS categoryName,
            u.nickname AS author
        FROM 
            Post p
        INNER JOIN category c ON p.category_id = c.id
        INNER JOIN User u ON p.user_id = u.id
        INNER JOIN local l ON p.local_id = l.id
        WHERE 
            l.id = ? AND l.location_name = ? AND p.status = 'ACTIVE';
    `;

    try {
        // SQL 쿼리 실행
        const [posts] = await pool.execute(sql, [tripId, local]);

        // 결과 반환
        return posts;
    } catch (error) {
        throw new Error(`Failed to fetch spontaneous posts: ${error.message}`);
    }
};

// 여행 일정 목록 조회
export const getTripSchedulesByUserId = async (userId) => {
    const sql = `
        SELECT id, user_id, mission_id, location, participants, vehicle, duration, startDate, endDate
        FROM travel
        WHERE NOW() BETWEEN startDate AND endDate -- 현재 날짜에 해당하는 여행만 조회
          AND user_id = ?; -- 특정 userId로 필터링
    `;

    try {
        const [trips] = await pool.execute(sql, [userId]);
        return trips;
    } catch (error) {
        throw new Error(`Failed to fetch trip schedules: ${error.message}`);
    }
};

// 지난 여행 일정 목록 조회
export const getPastTripsByUserId = async (userId) => {
    const sql = `
        SELECT id, user_id, mission_id, location, participants, vehicle, duration, startDate, endDate
        FROM travel
        WHERE endDate < NOW() -- 종료된 여행만 조회
          AND user_id = ?; -- 특정 userId로 필터링
    `;

    try {
        const [trips] = await pool.execute(sql, [userId]);
        return trips;
    } catch (error) {
        throw new Error(`Failed to fetch past trips: ${error.message}`);
    }
};

