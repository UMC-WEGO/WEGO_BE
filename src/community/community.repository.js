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
        SELECT p.id, c.name AS category_name, l.name AS local_name, p.title, p.content, p.picture_url, p.created_at
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
    const {category_id, local_id, title, content, picture_url} = data;

    const picture_url_json = JSON.stringify(picture_url);
    
    const query =`
        UPDATE post 
        SET category_id = ?, local_id = ?, title = ?, content = ?, picture_url = ?, updated_at = NOW()
        WHERE id = ?;
    `;

    const [result] = await pool.execute(query, [category_id, local_id, title, content, picture_url_json, post_id]);
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


// 전체 게시글 조회
export const get_all_posts_repository = async(page,limit) => {
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.id, JSON_UNQUOTE(JSON_EXTRACT(p.picture_url, '$[0]')) AS picture_url, c.name AS category_name, p.title, p.content, l.name AS local_name, p.created_at
        FROM post p
        JOIN category c ON c.id = p.category_id
        JOIN local l ON l.id = p.local_id
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
        SELECT * FROM post
        WHERE category_id = ?
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
        ;
    `;
    const [rows] = await pool.execute(query, [category_id]);
    return rows;
}


// 상위 2개 게시글 조회
export const get_top_post_repository = async (local_id) => {
    const query = `
        SELECT * FROM post
        WHERE local_id = ?
        ORDER BY created_at DESC
        LIMIT 2;
    `;
    const [rows] = await pool.execute(query, [local_id]);
    return rows;
}



// 인기게시판 조회



// 특정 게시글 조회 
export const get_post_by_id_repository = async (post_id) => {
    const query = `
        SELECT c.name AS category_name, u.nickname, p.created_at, p.title, p.content, p.picture_url
        FROM post p
        JOIN user u ON u.id = p.user_id
        JOIN category c ON c.id = p.category_id
        WHERE p.id = ?;  
    `;
    const [rows] = await pool.execute(query,[post_id]);

    return rows;
};



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