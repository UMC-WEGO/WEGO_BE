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
            m.id AS mission_id, 
            m.title AS mission_title, 
            m.content AS mission_content, 
            m.point AS mission_point,
            rm.status AS mission_status,
            rm.created_at AS mission_created_at,
            rm.updated_at AS mission_updated_at,
            -- 여행 일정 정보 추가
            t.id AS travel_id,
            t.user_id AS travel_user_id,
            t.location AS travel_location,
            t.vehicle AS travel_vehicle,
            t.duration AS travel_duration,
            t.startDate AS travel_startDate,
            t.endDate AS travel_endDate
        FROM 
            mission m
        JOIN 
            receive_mission rm ON m.id = rm.mission_id
        JOIN
            travel t ON rm.travel_id = t.id  -- 여행 ID와 매칭
        WHERE 
            rm.status = TRUE AND t.id = ?;   -- 완료된 미션이면서 특정 여행(tripId)에 속한 것만 조회
    `;

    try {
        const [result] = await pool.execute(sql, [tripId]);

        if (result.length === 0) {
            return null; // 여행 일정이 없을 경우
        }

        // 여행 일정 정보
        const travelInfo = {
            id: result[0].travel_id,
            user_id: result[0].travel_user_id,
            location: result[0].travel_location,
            participants: result[0].travel_participants,
            vehicle: result[0].travel_vehicle,
            duration: result[0].travel_duration,
            startDate: result[0].travel_startDate,
            endDate: result[0].travel_endDate,
            completed_missions: result.map(row => ({
                mission_id: row.mission_id,
                title: row.mission_title,
                content: row.mission_content,
                point: row.mission_point,
                status: row.mission_status,
                created_at: row.mission_created_at,
                updated_at: row.mission_updated_at
            }))
        };

        return travelInfo;
    } catch (error) {
        throw new Error(`Failed to fetch completed missions with travel details: ${error.message}`);
    }
};


// 여행 ID로 여행 정보 가져오기
export const getTripById = async (tripId) => {
    const sql = `
        SELECT 
            t.id, 
            t.user_id, 
            t.location, 
            t.adult_participants,
            t.child_participants, 
            t.vehicle, 
            t.duration, 
            t.startDate, 
            t.endDate,
            -- 리시브 미션 테이블 정보 가져오기
            rm.id AS mission_id,
            rm.mission_id AS original_mission_id,
            rm.content AS mission_content,
            rm.picture AS mission_picture,
            rm.status AS mission_status,
            rm.created_at AS mission_created_at,
            rm.updated_at AS mission_updated_at
        FROM travel t
        LEFT JOIN receive_mission rm ON t.id = rm.travel_id -- 여행 ID와 receive_mission의 travel_id 매칭
        WHERE t.id = ?;
    `;

    try {
        const [result] = await pool.execute(sql, [tripId]);

        if (result.length === 0) {
            return null; // 여행 일정이 없을 경우
        }

        // 미션 정보를 배열로 변환
        const tripData = {
            id: result[0].id,
            user_id: result[0].user_id,
            location: result[0].location,
            participants: result[0].participants,
            vehicle: result[0].vehicle,
            duration: result[0].duration,
            startDate: result[0].startDate,
            endDate: result[0].endDate,
            missions: result
                .map(row => ({
                    mission_id: row.mission_id,
                    original_mission_id: row.original_mission_id,
                    content: row.mission_content,
                    picture: row.mission_picture,
                    status: row.mission_status,
                    created_at: row.mission_created_at,
                    updated_at: row.mission_updated_at
                }))
                .filter(mission => mission.mission_id !== null) // null 값 제거
        };

        return tripData;
    } catch (error) {
        throw new Error(`Failed to fetch travel schedule: ${error.message}`);
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
        SELECT id, user_id, location, adult_participants, child_participants, vehicle, duration, startDate, endDate
        FROM travel
        WHERE user_id = ?; -- 특정 userId로 필터링
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
        SELECT id, user_id, location, adult_participants, child_participants, vehicle, duration, startDate, endDate
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


// 특정 여행 일정 조회
export const getTravelById = async (tripId) => {
    const sql = `
        SELECT 
            t.id, 
            t.location, 
            t.vehicle, 
            t.duration, 
            t.adult_participants,
            t.child_participants
            t.startDate, 
            t.endDate
        FROM 
            travel t
        WHERE 
            t.id = ?;
    `;

    try {
        const [result] = await pool.execute(sql, [tripId]);
        return result[0]; // 단일 여행 정보 반환
    } catch (error) {
        throw new Error(`Failed to fetch trip by ID: ${error.message}`);
    }
};

// 특정 여행 일정 날짜 수정
export const updateTripDatesById = async (tripId, startDate, endDate) => {
    const sql = `UPDATE travel SET startDate = ?, endDate = ?, updated_at = NOW() WHERE id = ?`;
    
    try {
        const [result] = await pool.execute(sql, [startDate, endDate, tripId]);
        return result;
    } catch (error) {
        throw new Error(`Failed to update trip dates: ${error.message}`);
    }
};

// 🛠 여행 인원수 업데이트
export const updateTripParticipants = async (tripId, adultCount, childCount) => {
    const sql = `
        UPDATE travel 
        SET adult_participants = ?, child_participants = ?, updated_at = NOW()
        WHERE id = ?;
    `;

    try {
        const [result] = await pool.execute(sql, [adultCount, childCount, tripId]);
        return result.affectedRows > 0; // 수정 여부 반환
    } catch (error) {
        throw new Error(`Failed to update trip participants: ${error.message}`);
    }
};