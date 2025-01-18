import {create_post_response_dto} from "./community.dto.js"

import {
    create_post_repository,
    update_post_repository,
    delete_post_repository,
    get_all_posts_repository,
    get_top_post_repository,
    get_posts_by_category_repository,
    get_post_by_id_repository,
} from "./community.repository.js"

// 게시글 작성
export const create_post_service = async (data) => {
    try{
        const post_key = await create_post_repository(data);
        console.log("생성된 post_key: ", post_key);

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


// 전체 글 조회
export const get_all_posts_service = async(page, limit) => {
    const all_posts = await get_all_posts_repository(page,limit);

    return all_posts;
}


// 카테고리별 글 조회
export const get_posts_by_category_service = async (category_id,page,limit) => {
    const posts = await get_posts_by_category_repository(category_id,page,limit);

    return posts;
}


// 즉흥 게시판 상위 2개만 조회
export const get_top_post_service = async(local_id) => {
    const top_posts = await get_top_post_repository(local_id);

    return top_posts;
}


// 특정 게시물 조회 
export const get_post_by_id_service = async(post_id) => {
    const post = await get_post_by_id_repository(post_id);

    if(!post) {
        throw new Error("게시글을 찾을 수 없습니다.");
    }

    return post;
}