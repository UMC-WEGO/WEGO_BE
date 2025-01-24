import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db.config.js";

// 게시글 작성 
export const create_post_repository = async(data) => {
    const { category_id, user_id, local_id, title, content, picture_url} = data;

    const query = `
        INSERT INTO post (category_id, user_id, local_id, title, content, picture_url, created_at)
        VALUES (?,?,?,?,?,?,NOW());
    `;

    const picture_url_json = JSON.stringify(picture_url);
    const [result] = await pool.execute(query, [category_id, user_id, local_id, title, content, picture_url_json]);

    const post_id = result.insertId;
    const new_query = `
        SELECT p.id, c.name AS category_name, l.location_name AS location_name, p.title, p.content, p.picture_url, p.created_at
        FROM post p
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        WHERE p.id = ?;
    `;

    const [new_post] = await pool.execute(new_query, [post_id]);

    return new_post[0];
};

// 게시글 수정
export const update_post_repository = async (post_id, data) => {

    const updates = [];
    const values = [];

    if (data.category_id !== undefined) {
        updates.push("category_id = ?");
        values.push(data.category_id);
    }
    if (data.local_id !== undefined) {
        updates.push("local_id = ?");
        values.push(data.local_id);
    }
    if (data.title !== undefined) {
        updates.push("title = ?");
        values.push(data.title);
    }
    if (data.content !== undefined) {
        updates.push("content = ?");
        values.push(data.content);
    }
    if (data.picture_url !== undefined) {
        updates.push("picture_url = ?");
        values.push(JSON.stringify(data.picture_url));
    }

    if (updates.length === 0) {
        return false; 
    }
    
    const query =`
        UPDATE post 
        SET ${updates.join(',')}, updated_at = NOW()
        WHERE id = ?;
    `;

    values.push(post_id);

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
};

// 게시글 삭제 
export const delete_post_repository = async(post_id) => {
    const query = `
        DELETE FROM post
        WHERE id = ?;
    `;
    const [result] = await pool.execute(query, [post_id]);
    return result.affectedRows > 0;
}



// 최근 검색어 - 조회 
export const get_local_search_repository = async(user_id) => {
    const query = `
        SELECT location 
	    FROM travel
	    WHERE endDate < NOW() and user_id = ?
	    ORDER BY endDate DESC
	    LIMIT 5; 
    `;

    const [searches] = await pool.execute(query,[user_id]);
    return searches.map(search => search.location);
}



// 전체 게시글 조회
export const get_all_posts_repository = async(page,limit) => {
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset};

    `;
    const[rows] = await pool.execute(query);

    return rows;
}


// 카테고리별 조회
export const get_posts_by_category_repository = async(category_id,page,limit) => {
    const offset = (page- 1) * limit;

    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        WHERE category_id = ?
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset};
    `;
    const [rows] = await pool.execute(query, [category_id]);
    return rows;
}


// 상위 2개 게시글 조회 - 지역 
export const get_top_post_by_local_repository = async (local_id) => {
    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        WHERE local_id = ?
        ORDER BY created_at DESC

        LIMIT 2;
    `;
    const [rows] = await pool.execute(query, [local_id]);
    return rows;
}


// 상위 2개 게시글 조회 - 전체
export const get_posts_top_repository = async() => {
    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        
        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        ORDER BY created_at DESC
        LIMIT 2;
    `;
    
    const [rows] = await pool.execute(query);

    return rows;
}


// 인기게시판 조회
export const get_popular_posts_repository = async() => {
    const query = `
        SELECT 
            p.id, p.category_id, p.title, p.content, p.created_at, p.local_id,
            COALESCE(c.comment_count, 0) AS comment_count,
            COALESCE(l.like_count, 0) AS like_count,
            COALESCE(s.scrap_count, 0) AS scrap_count,

            (COALESCE(l.like_count, 0) * 5 +
            COALESCE(c.comment_count, 0) * 10 +
            COALESCE(s.scrap_count, 0) * 5 -
            (TIMESTAMPDIFF(HOUR, p.created_at, NOW()) * 0.5)) AS popularity_score
        FROM post p
        LEFT JOIN 
            (SELECT post_id, COUNT(*) AS comment_count 
            FROM comment 
            GROUP BY post_id) c ON p.id = c.post_id
        LEFT JOIN 
            (SELECT post_id, COUNT(*) AS like_count 
            FROM \`like\`
            GROUP BY post_id) l ON p.id = l.post_id
        LEFT JOIN 
            (SELECT post_id, COUNT(*) AS scrap_count 
            FROM scrap 
            GROUP BY post_id) s ON p.id = s.post_id

        WHERE p.created_at >= DATE_ADD(NOW(), INTERVAL -5 DAY)
        ORDER BY popularity_score DESC
        LIMIT 20;
    `;

    const [rows] = await pool.execute(query);

    return rows;
}


// 특정 게시글 조회 
export const get_post_by_id_repository = async (post_id) => {
    const post_query = `
        SELECT c.name AS category_name, u.profile_image AS post_author_profile, u.nickname AS post_author_nickname, p.created_at AS post_created_at, p.title, p.content, p.picture_url,
               comment_count.comment_counts, like_count.like_counts, scrap_count.scrap_counts
        FROM post p

        JOIN user u ON u.id = p.user_id
        JOIN category c ON c.id = p.category_id

        LEFT JOIN (SELECT post_id, count(*) AS comment_counts FROM comment GROUP BY post_id) AS comment_count ON comment_count.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_counts FROM \`like\` GROUP BY post_id) AS like_count ON like_count.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_counts FROM scrap GROUP BY post_id) AS scrap_count ON scrap_count.post_id = p.id
        WHERE p.id = ?;
    `;

    const [post_result] = await pool.execute(post_query, [post_id]);

    if(post_result.length === 0) { return null; }

    const post_info = post_result[0];

    const comment_query = `
	    SELECT cm.user_id, cu.nickname AS comment_author_name, cu.profile_image AS comment_author_profile, cm.created_at AS comment_created_at, cm.content AS comment_content
	    FROM comment cm 
	    JOIN user cu ON cu.id = cm.user_id
	    WHERE cm.post_id = ?;
    `;

    const [comment_result] = await pool.execute(comment_query,[post_id]);

    return {
        post_info,
        comments : comment_result
    } ;
};


// 내가 작성한 글 조회 
export const get_my_posts_repository = async (user_id) => {
    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        
        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        WHERE p.user_id = ?;  
    `;

    const [rows] = await pool.execute(query,[user_id]);
    return rows;
}



// 댓글 작성 
export const create_comment_repository = async(post_id, data) => {
    const {user_id, content} = data;

    const query = `
        INSERT INTO comment (user_id, post_id, content, created_at)
        VALUES (?,?,?,NOW());
    `;

    const [result] = await pool.execute(query, [user_id, post_id, content]);

    const comment_id = result.insertId;

    const new_query = `
        SELECT u.nickname AS user_nickname, u.profile_image AS user_profile_image, c.content, c.created_at
        FROM comment c
        JOIN user u ON u.id = c.user_id
        WHERE c.id = ?;
    `;

    const[new_post] = await pool.execute(new_query,[comment_id]);

    return new_post[0];
}

// 댓글 삭제 
export const delete_comment_respository = async(post_id, comment_id) => {
    const query = `
        DELETE FROM comment
        WHERE post_id = ? AND id = ?;
    `;

    const [result] = await pool.execute(query,[post_id, comment_id]);

    return result.affectedRows > 0;
}



// 좋아요 눌렀는지 확인용 
export const check_like_exist_repository = async(post_id, user_id) => {
    const query = `
        SELECT count(*) AS count 
        FROM \`like\`
        WHERE post_id = ? and user_id = ?;
    `;

    const [rows] = await pool.execute(query, [post_id, user_id]);
    return rows[0].count > 0;
}

// 좋아요 누르기
export const create_like_repository = async(post_id, user_id) => {
    const query = `
        INSERT INTO  \`like\` (post_id, user_id, created_at)
        VALUES (?,?,NOW());
    `;

    const [result] = await pool.execute(query,[post_id,user_id]);
    
    return result.affectedRows > 0;
}

// 좋아요 취소하기 
export const delete_like_repository = async(post_id, user_id) => {
    const query = `
        DELETE FROM \`like\`
        WHERE post_id =? and user_id = ?;
    `;

    const [result] = await pool.execute(query, [post_id, user_id]);
    return result.affectedRows > 0;
}



// 스크랩 눌렀는지 확인용  
export const check_scrap_exist_repository = async(post_id, user_id) => {
    const query = `
       SELECT count(*) AS count 
        FROM scrap
        WHERE post_id = ? and user_id = ?;
    `;

    const [rows] = await pool.execute(query, [post_id, user_id]);
    return rows[0].count > 0;
}

// 스크랩 누르기 
export const create_scrap_repository = async(post_id, user_id) => {
    const query = `
        INSERT INTO  scrap (post_id, user_id)
        VALUES (?,?);
    `;

    const [result] = await pool.execute(query,[post_id, user_id]);
    
    return result.affectedRows > 0;
}

// 스크랩 취소하기 
export const delete_scrap_repository = async(post_id, user_id) => {
    const query = `
        DELETE FROM scrap
        WHERE post_id =? and user_id = ?;
    `;

    const [result] = await pool.execute(query, [post_id, user_id]);
    return result.affectedRows > 0;
}

// 스크랩 조회
export const get_scrap_repository = async(user_id) => {
    const query = `
        SELECT p.id, c.name AS category_name, p.title, p.content, l.location_name AS location_name,p.created_at,
            COALESCE(comment_counts.comment_count, 0) AS total_comment,
            COALESCE(like_counts.like_count, 0) AS total_like,
            COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM scrap s

        JOIN post p ON p.id = s.post_id
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON p.id = comment_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON p.id = like_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON p.id = scrap_counts.post_id

        WHERE s.user_id = ?;
    `;

    const[rows] = await pool.execute(query,[user_id]);

    return rows;
}

// 스크랩 조회 - 카테고리별 
export const get_scrap_by_category_repository = async(user_id, category_id) => {
    const query = `
        SELECT p.id, c.name, p.title, p.content, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, l.location_name, p.created_at,
	        COALESCE(comment_counts.comment_count, 0) AS total_comment,
	        COALESCE(like_counts.like_count, 0) AS total_like,
	        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap 

        FROM post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM comment GROUP BY post_id) AS comment_counts ON p.id = comment_counts.post_id 
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`like\` GROUP BY post_id) AS like_counts ON p.id = like_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON p.id = scrap_counts.post_id 

        WHERE p.user_id = ? and p.category_id = ? ;
    `;

    const [rows] = await pool.execute(query, [user_id, category_id]);
    return rows;
}



// 게시글 작성자 프로필 조회
export const get_user_profile_repository = async(user_id) =>{
    const query = `
        SELECT u.nickname, u.profile_image, u.temp, impromptu_total.travel_counts, post_count.post_counts, mission_count.mission_counts
	    
        FROM user u

	    LEFT JOIN ( SELECT user_id, COUNT(*) AS travel_counts FROM travel WHERE endDate < NOW() GROUP BY user_id) AS impromptu_total  ON impromptu_total.user_id = u.id

	    LEFT JOIN (SELECT user_id, COUNT(*) AS post_counts FROM post p GROUP BY user_id) AS post_count ON post_count.user_id = u.id
	    LEFT JOIN (SELECT user_id, COUNT(*) AS mission_counts FROM receive_mission rm Group BY user_id) AS mission_count ON mission_count.user_id = u.id

	    WHERE u.id = ?;
    `;
    
    const [user_result] = await pool.execute(query,[user_id]);

    if(user_result.length === 0) { return null; }
    const user_info = user_result[0];

    const count_query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at
        
        FROM post p 

	    JOIN category c ON c.id = p.category_id
	    JOIN local l ON l.id = p.local_id

	    WHERE p.user_id = ?;
    `;

    const [total_posts] = await pool.execute(count_query, [user_id]);

    return {
        user_info, 
        posts: total_posts
    };

}