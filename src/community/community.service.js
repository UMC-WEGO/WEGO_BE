import {
    create_post_response_dto, 
    create_comment_response_dto,
} from "./community.dto.js"

import {
    create_post_repository,
    update_post_repository,
    delete_post_repository,

    get_local_search_repository,

    get_all_posts_repository,
    get_posts_top_repository,
    get_top_post_by_local_repository,
    get_posts_by_category_repository,

    get_popular_posts_repository,
    get_post_by_id_repository,

    get_my_posts_repository,

    create_comment_repository,
    delete_comment_respository,

    create_like_repository,
    delete_like_repository,

    create_scrap_repository,
    delete_scrap_repository,
    get_scrap_repository,
    get_scrap_by_category_repository,

    get_user_profile_repository,

} from "./community.repository.js"



// 게시글 작성
export const create_post_service = async (data) => {
    try{
        const post_key = await create_post_repository(data);

        if(!post_key) {
            throw new Error("postKey가 존재하지 않습니다.");
        }

        const response_dto = create_post_response_dto(post_key);

        return response_dto;

    } catch(error) {
        console.error("게시글 생성 서비스 에러: ", error);
        throw error;
    }
}

// 게시물 수정
export const update_post_service = async (post_id, data) => {
    const update_key = await update_post_repository(post_id, data);

    if(!update_key) {
        throw new Error("updateKey가 존재하지 않습니다.");
    }

    return update_key;
}

//게시물 삭제
export const delete_post_service = async (post_id) => {
    const delete_key = await delete_post_repository(post_id);

    if(!delete_key) {
        throw new Error("게시물이 삭제되지 않았습니다.");
    }

    return delete_key;
}



// 최근 검색어 - 조회 
export const get_local_search_service = async(user_id) => {
    const get_key = await get_local_search_repository(user_id);
    
    if(Array.isArray(get_key) && get_key.length === 0) {
        throw new Error("최근 검색어가 조회되지 않았습니다.");
    }
    return get_key;
}



// 전체 글 조회
export const get_all_posts_service = async(cursor) => {
    const all_posts = await get_all_posts_repository(cursor);

    return all_posts;
}


// 카테고리별 글 조회
export const get_posts_by_category_service = async (category_id,cursor) => {
    const posts = await get_posts_by_category_repository(category_id,cursor);

    return posts;
}


// 즉흥 게시판 상위 2개만 조회 - 지역별 
export const get_top_post_by_local_service = async(local_id) => {
    const top_posts_by_local = await get_top_post_by_local_repository(local_id);

    return top_posts_by_local;
}


// 상위 2개 게시판 조회 - 전체
export const get_top_post_service = async()=> {
    const top_posts = await get_posts_top_repository();
    return top_posts;
}


// 인기 게시판 조회 
export const get_popular_posts_service = async() => {
    const popular_posts = await get_popular_posts_repository();
    return popular_posts;
}


// 특정 게시물 조회 
export const get_post_by_id_service = async(post_id) => {
    const post = await get_post_by_id_repository(post_id);

    if(!post || !post.post_info || !post.post_info.id) {
        throw new Error("게시글을 찾을 수 없습니다.");
    }

    return post;
}


// 내가 작성한 글 조회
export const get_my_posts_service = async(user_id) => {
    const get_posts = await get_my_posts_repository(user_id);

    if (get_posts.length === 0) {
        throw new Error ("아직 작성한 글이 없습니다."); 
    }

    return get_posts;
}



// 댓글 작성 
export const create_comment_service = async(post_id, data) => {
    try {
        const post_key = await create_comment_repository(post_id, data);

        if(!post_key) {
            throw new Error("댓글이 작성되지 않았습니다.");
        }
        
        const response_dto = create_comment_response_dto(post_key);

        return response_dto;
    } catch(error){
        console.error("댓글 작성 서비스 에러: ", error);
        throw error;

    }
};

// 댓글 삭제
export const delete_comment_service = async(post_id, comment_id) => {
    const delete_key = await delete_comment_respository(post_id, comment_id);

    if(!delete_key){
        throw new Error("댓글이 삭제되지 않았습니다.");
    }

    return delete_key;
}



// 좋아요 누르기 
export const create_like_service = async(post_id, user_id) => {
    const like_key = await create_like_repository(post_id, user_id);

    if(!like_key){
        throw new Error("좋아요가 눌러지지 않았습니다.");
    }

    return like_key;
}

// 좋아요 취소하기
export const delete_like_service = async(post_id, user_id) => {
    const delete_like_key = await delete_like_repository(post_id, user_id);

    if(!delete_like_key) {
        throw new Error("좋아요가 취소되지 않았습니다.");
    }

    return delete_like_key;
}



// 스크랩 누르기 
export const create_scrap_service = async(post_id, user_id) => {
    const scrap_key = await create_scrap_repository(post_id, user_id);

    if(!scrap_key){
        throw new Error("스크랩되지 않았습니다.");
    }

    return scrap_key;
}

// 스크랩 취소하기 
export const delete_scrap_service = async (post_id, user_id) => {
    const delete_scrap_key = await delete_scrap_repository(post_id, user_id);

    if(!delete_scrap_key) {
        throw new Error("스크랩이 취소되지 않았습니다.");
    }
    return delete_scrap_key;
}

// 스크랩 조회 
export const get_scrap_service = async(user_id, cursor) => {
    const get_scrap_key = await get_scrap_repository(user_id, cursor);

    if(Array.isArray(get_scrap_key) && get_scrap_key.length ===0){
        throw new Error("스크랩 조회가 되지 않았습니다.");
    }
    return get_scrap_key;
}

// 스크랩 조회 - 카테고리별 
export const get_scrap_by_category_service = async(user_id, category_id, cursor) => {
    const get_scrap_by_category_key = await get_scrap_by_category_repository(user_id, category_id, cursor);

    if(Array.isArray(get_scrap_by_category_key) && get_scrap_by_category_key.length === 0) {
        throw new Error("카테고리별 스크랩 조회가 되지 않았습니다.");
    }

    return get_scrap_by_category_key;
}



// 게시글 작성자 프로필 조회
export const get_user_profile_service = async(user_id) => {
    const get_profile = await get_user_profile_repository(user_id);

    if(!get_profile) {
        throw new Error("프로필 조회가 되지 않았습니다.");
    }

    return get_profile;
}