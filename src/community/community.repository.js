import { pool } from "../../config/db.config.js";

// 게시글 작성 
export const create_post_repository = async(data, user_id) => {
    const { category_id, local_id, title, content, picture_url} = data;

    const query = `
        INSERT INTO Post (category_id, user_id, local_id, title, content, picture_url, created_at)
        VALUES (?,?,?,?,?,?,NOW());
    `;

    const picture_url_json = JSON.stringify(picture_url);
    const [result] = await pool.execute(query, [category_id, user_id, local_id, title, content, picture_url_json]);

    const post_id = result.insertId;

    if(picture_url && picture_url.length >0) {
        const image_query = `
            INSERT INTO image (post_id, imgUrl, created_at)
            VALUES ${picture_url.map(() => "(?, ?, NOW())").join(", ")}
        `;

        const image_values = picture_url.flatMap(url => [post_id, url]);
        await pool.execute(image_query, image_values);
    }
    
    const new_query = `
        SELECT p.id, c.name AS category_name, l.location_name AS location_name, u.nickname AS user_nickname, p.title, p.content, p.picture_url, p.created_at
        FROM Post p
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        JOIN User u ON u.id = p.user_id
        WHERE p.id = ?;
    `;

    const [new_post] = await pool.execute(new_query, [post_id]);

    return new_post[0];
};


// 게시글 사진 정보를 가져옴  
export const get_post_repository = async(post_id, user_id) => {
    const query = `
        SELECT picture_url
        FROM Post
        WHERE id = ? AND user_id = ?;
    `;

    const [rows] = await pool.execute(query,[post_id, user_id]);

    if(rows.length ===0) {
        return null;
    }

    const picture_urls = JSON.parse(rows[0].picture_url);

    return {
        picture_urls
    };
}

// 게시글 수정
export const update_post_repository = async (post_id, user_id, data) => {

    const updates = [];
    const values = [];

    const current_post_query = 'SELECT * FROM Post WHERE id = ? AND user_id = ?';
    const [current_post] = await pool.execute(current_post_query, [post_id, user_id]);

    if (current_post.length === 0) {
        throw new Error("게시물을 찾을 수 없습니다.");
    }

    const existing_post = current_post[0];

    const category_id = (data.category_id !== undefined && data.category_id !== null && data.category_id !== "") 
        ? data.category_id 
        : existing_post.category_id;
    updates.push("category_id = ?");
    values.push(category_id);

    const local_id = (data.local_id !== undefined && data.local_id !== null && data.local_id !== "") 
        ? data.local_id 
        : existing_post.local_id;
    updates.push("local_id = ?");
    values.push(local_id);
 
    const title = (data.title !== undefined && data.title !== null && data.title !== "") 
        ? data.title 
        : existing_post.title;
    updates.push("title = ?");
    values.push(title);
 
    const content = (data.content !== undefined && data.content !== null && data.content !== "") 
        ? data.content 
        : existing_post.content;
    updates.push("content = ?");
    values.push(content);
 
    const picture_url = (data.picture_url !== undefined && data.picture_url !== null && data.picture_url !== "") 
        ? JSON.stringify(data.picture_url) 
        : existing_post.picture_url;
    updates.push("picture_url = ?");
    values.push(picture_url);


    if (updates.length === 0) {
        return false; 
    }
    
    const query =`
        UPDATE Post 
        SET ${updates.join(',')}, updated_at = NOW()
        WHERE id = ? AND user_id = ?;
    `;

    values.push(post_id, user_id);

    const [result] = await pool.execute(query, values);

    if(result.affectedRows >0){
        const delete_image_query = `
            DELETE FROM image
            WHERE post_id = ?;
        `;
        await pool.execute(delete_image_query,[post_id]);

        if(data.picture_url && data.picture_url.length > 0){
            const image_query = `
                INSERT INTO image (post_id, imgUrl, created_at) 
                VALUES ${data.picture_url.map(()=> "(?,?,NOW())").join(",")};
            `;

            const image_values = data.picture_url.flatMap(url => [post_id, url]);
            await pool.execute(image_query, image_values);
        }
    }
    return result.affectedRows > 0;
};

// 게시글 삭제 
export const delete_post_repository = async(post_id, user_id) => {
    const query = `
        DELETE FROM Post
        WHERE id = ? AND user_id = ?;
    `;
    const [result] = await pool.execute(query, [post_id, user_id]);
    return result.affectedRows > 0;
}



// 최근 검색어 - 조회 (최근 여행 출발지 최대 3개)
export const get_local_search_repository = async(user_id) => {
    const query = `
        SELECT  l.id AS local_id, l.region_name AS region_name, l.location_name AS location_name
        FROM travel t
        JOIN local l ON l.location_name = t.location
        WHERE t.user_id = ?
        ORDER BY updated_at desc
        LIMIT 3;
    `;

    const [searches] = await pool.execute(query,[user_id]);
    return searches;
}



// 전체 게시글 조회
export const get_all_posts_repository = async(cursor) => {
    const limit = 20;

    const query = `
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE p.id < ?
        ORDER BY p.id DESC
        LIMIT ${limit};

    `;
    const[rows] = await pool.execute(query,[cursor]);

    return rows;
}


// 카테고리별 조회
export const get_posts_by_category_repository = async(category_id,cursor) => {
    const limit = 20;

    const query = `
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE category_id = ? AND p.id < ?
        ORDER BY p.id DESC

        LIMIT ${limit};
    `;
    const [rows] = await pool.execute(query, [category_id, cursor]);
    return rows;
}


// 상위 2개 게시글 조회 - 지역 
export const get_top_post_by_local_repository = async (local_id) => {
    const query = `
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE p.local_id = ?
        ORDER BY p.id DESC

        LIMIT 2;
    `;
    const [rows] = await pool.execute(query, [local_id]);
    return rows;
}


// 상위 2개 게시글 조회 - 전체
export const get_posts_top_repository = async() => {
    const query = `
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        
        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

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
            p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, lc.location_name AS location_name, p.created_at, 

            COALESCE(c.comment_count, 0) AS comment_count,
            COALESCE(l.like_count, 0) AS like_count,
            COALESCE(s.scrap_count, 0) AS scrap_count,

            (COALESCE(l.like_count, 0) * 5 +
            COALESCE(c.comment_count, 0) * 10 +
            COALESCE(s.scrap_count, 0) * 5 -
            (TIMESTAMPDIFF(HOUR, p.created_at, NOW()) * 0.5)) AS popularity_score
        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local lc ON lc.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) c ON p.id = c.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`Like\` GROUP BY post_id) l ON p.id = l.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) s ON p.id = s.post_id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

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
        SELECT p.id, c.name AS category_name, u.profile_image AS post_author_profile, u.nickname AS post_author_nickname, p.title, p.content, p.created_at, p.updated_at,
            GROUP_CONCAT(i.imgUrl ORDER BY i.id ASC) AS picture_urls,
            comment_count.comment_counts, like_count.like_counts, scrap_count.scrap_counts
        FROM Post p

        JOIN User u ON u.id = p.user_id
        JOIN category c ON c.id = p.category_id

        LEFT JOIN (SELECT post_id, count(*) AS comment_counts FROM Comment GROUP BY post_id) AS comment_count ON comment_count.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_counts FROM \`Like\` GROUP BY post_id) AS like_count ON like_count.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_counts FROM scrap GROUP BY post_id) AS scrap_count ON scrap_count.post_id = p.id
        
        LEFT JOIN image i ON i.post_id = p.id
        
        WHERE p.id = ?;
    `;

    const [post_result] = await pool.execute(post_query, [post_id]);

    if(post_result.length === 0) { return null; }

    const post_info = post_result[0];

    post_info.picture_urls = post_info.picture_urls ? post_info.picture_urls.split(',') : [];

    const comment_query = `
	    SELECT cm.user_id, cu.nickname AS comment_author_name, cu.profile_image AS comment_author_profile, cm.created_at AS comment_created_at, cm.content AS comment_content
	    FROM Comment cm 
	    JOIN User cu ON cu.id = cm.user_id
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
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at,
        COALESCE(comment_counts.comment_count, 0) AS total_comment,
        COALESCE(like_counts.like_count, 0) AS total_like,
        COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM Post p

        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
        
        LEFT JOIN ( SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON comment_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON like_counts.post_id = p.id
        LEFT JOIN (SELECT post_id, count(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON scrap_counts.post_id = p.id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE p.user_id = ?;  
    `;

    const [rows] = await pool.execute(query,[user_id]);
    return rows;
}



// 댓글 작성 
export const create_comment_repository = async(post_id, user_id, data) => {
    const {content} = data;

    const query = `
        INSERT INTO Comment (user_id, post_id, content, created_at)
        VALUES (?,?,?,NOW());
    `;

    const [result] = await pool.execute(query, [user_id, post_id, content]);

    const comment_id = result.insertId;

    const new_query = `
        SELECT u.nickname AS user_nickname, u.profile_image AS user_profile_image, c.content, c.created_at
        FROM Comment c
        JOIN User u ON u.id = c.user_id
        WHERE c.id = ?;
    `;

    const[new_post] = await pool.execute(new_query,[comment_id]);

    return new_post[0];
}

// 댓글 삭제 
export const delete_comment_respository = async(post_id, comment_id, user_id) => {
    const query = `
        DELETE FROM Comment
        WHERE post_id = ? AND id = ? AND user_id = ?;
    `;

    const [result] = await pool.execute(query,[post_id, comment_id, user_id]);

    return result.affectedRows > 0;
}

// 게시글의 존재 여부 
export const check_post_exist_repository = async(post_id) => {
    const query = `SELECT count(*) AS count FROM Post WHERE id = ?`;
    const [rows] = await pool.execute(query, [post_id]);
    return rows[0].count > 0;
}

// 좋아요 눌렀는지 확인용 
export const check_like_exist_repository = async(post_id, user_id) => {
    const query = `
        SELECT count(*) AS count 
        FROM \`Like\`
        WHERE post_id = ? and user_id = ?;
    `;

    const [rows] = await pool.execute(query, [post_id, user_id]);
    return rows[0].count > 0;
}

// 좋아요 누르기
export const create_like_repository = async(post_id, user_id) => {
    const query = `
        INSERT INTO  \`Like\` (post_id, user_id, created_at)
        VALUES (?,?,NOW());
    `;

    const [result] = await pool.execute(query,[post_id,user_id]);
    
    return result.affectedRows > 0;
}

// 좋아요 취소하기 
export const delete_like_repository = async(post_id, user_id) => {
    const query = `
        DELETE FROM \`Like\`
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
export const get_scrap_repository = async(user_id, cursor) => {
    const limit = 20;

    const query = `
        SELECT p.id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name,p.created_at,
            COALESCE(comment_counts.comment_count, 0) AS total_comment,
            COALESCE(like_counts.like_count, 0) AS total_like,
            COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM scrap s

        JOIN Post p ON p.id = s.post_id
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON p.id = comment_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON p.id = like_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON p.id = scrap_counts.post_id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE s.user_id = ? AND p.id < ?
        ORDER BY p.id DESC
        LIMIT ${limit};
    `;

    const[rows] = await pool.execute(query,[user_id, cursor]);

    return rows;
}

// 스크랩 조회 - 카테고리별 
export const get_scrap_by_category_repository = async(user_id, category_id, cursor) => {
    const limit = 20;

    const query = `
        SELECT p.id AS post_id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name,p.created_at,
            COALESCE(comment_counts.comment_count, 0) AS total_comment,
            COALESCE(like_counts.like_count, 0) AS total_like,
            COALESCE(scrap_counts.scrap_count, 0) AS total_scrap

        FROM scrap s

        JOIN Post p ON p.id = s.post_id
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, COUNT(*) AS comment_count FROM Comment GROUP BY post_id) AS comment_counts ON p.id = comment_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS like_count FROM \`Like\` GROUP BY post_id) AS like_counts ON p.id = like_counts.post_id
        LEFT JOIN (SELECT post_id, COUNT(*) AS scrap_count FROM scrap GROUP BY post_id) AS scrap_counts ON p.id = scrap_counts.post_id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

        WHERE s.user_id = ? AND p.category_id = ? AND p.id < ?
        ORDER BY p.id DESC
        LIMIT ${limit};
    `;

    const [rows] = await pool.execute(query, [user_id, category_id, cursor]);

    return rows;
}



// 게시글 작성자 프로필 조회
export const get_user_profile_repository = async(user_id) =>{
    const query = `
        SELECT u.nickname, u.profile_image, u.temp, impromptu_total.travel_counts, post_count.post_counts, mission_count.mission_counts
	    
        FROM User u

	    LEFT JOIN ( SELECT user_id, COUNT(*) AS travel_counts FROM travel WHERE endDate < NOW() GROUP BY user_id) AS impromptu_total  ON impromptu_total.user_id = u.id

	    LEFT JOIN (SELECT user_id, COUNT(*) AS post_counts FROM Post p GROUP BY user_id) AS post_count ON post_count.user_id = u.id
	    LEFT JOIN (SELECT user_id, COUNT(*) AS mission_counts FROM receive_mission rm Group BY user_id) AS mission_count ON mission_count.user_id = u.id

	    WHERE u.id = ?;
    `;
    
    const [user_result] = await pool.execute(query,[user_id]);

    if(user_result.length === 0) { return null; }
    const user_info = user_result[0];

    const count_query = `
        SELECT p.id, i.imgUrl AS picture_url, c.name AS category_name, p.title, p.content, l.location_name AS location_name, p.created_at
        
        FROM Post p 

	    JOIN category c ON c.id = p.category_id
	    JOIN local l ON l.id = p.local_id

        LEFT JOIN (SELECT post_id, imgUrl FROM image WHERE id IN (SELECT MIN(id) FROM image GROUP BY post_id)) AS i ON i.post_id = p.id

	    WHERE p.user_id = ?;
    `;

    const [total_posts] = await pool.execute(count_query, [user_id]);

    return {
        user_info, 
        posts: total_posts
    };

}