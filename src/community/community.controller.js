import { StatusCodes } from 'http-status-codes'; 
import {
    create_post_dto,
    create_post_response_dto,
    update_post_request_dto,
    update_post_response_dto,
    delete_post_response_dto,
    get_all_posts_response_dto,
    get_posts_by_category_response_dto,
    get_top_posts_response_dto,
    get_post_by_id_response_dto,

    get_comment_response_dto,
    delete_comment_response_dto,

    create_comment_dto,

} from "./community.dto.js"

import {
    create_post_service,
    update_post_service,
    delete_post_service,
    get_all_posts_service,
    get_posts_by_category_service,
    get_top_post_service,
    get_top_post_by_local_service,

    get_popular_posts_service,
    get_post_by_id_service,

    get_my_posts_service,

    create_comment_service,
    delete_comment_service,

    create_like_service,
    delete_like_service,

    create_scrap_service,
    delete_scrap_service,

    get_scrap_service,
    get_scrap_by_category_service,

} from "./community.service.js"


import {check_like_exist_repository, check_scrap_exist_repository} from "./community.repository.js"

import { parse } from 'dotenv';


// 게시글 작성
export const create_post_controller = async(req,res,next) => {
    try {
        const post_data = create_post_dto(req.body);
        const new_post = await create_post_service(post_data);

        res.status(StatusCodes.CREATED).json(new_post);

    } catch (error) {
        //next(error);
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "게시글 작성 중에 에러가 발생했습니다." });
    }
};


// 게시글 수정 
export const update_post_controller = async(req,res,next) => {
    const post_id = parseInt(req.params.post_id);
    const post_data = req.body;

    try {
        const updated_post = await update_post_service(post_id, post_data);

        if(!updated_post){
            return res.status(StatusCodes.NOT_FOUND).json({message : "게시물을 찾을 수 없습니다."});
        }
        res.status(StatusCodes.OK).json({ message: "내용이 변경되었습니다.",updated_post});
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시물 수정 중에 에러가 발생했습니다."});
    }
};


// 게시글 삭제
export const delete_post_controller = async(req,res,next) => {
    try {
        const post_id = parseInt(req.params.post_id);
        const result = await delete_post_service(post_id);

        if(result){
            res.status(StatusCodes.OK).json(delete_post_response_dto(post_id));
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "게시물을 찾을 수 없습니다."});
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시물 삭제 중에 에러가 발생했습니다."});
    }
};


// 전체 글 조회 
export const get_all_posts_controller = async(req,res,next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
        const posts = await get_all_posts_service(page, limit);
        res.status(StatusCodes.OK).json(posts);
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "전체 글 조회 중에 에러가 발생했습니다. "});
    }
};


// 카테고리별 글 조회
export const get_posts_by_category_controller = async(req,res,next)=> {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try{
        const category_id = parseInt(req.params.category_id);
        const posts = await get_posts_by_category_service(category_id,page,limit);

        res.status(StatusCodes.OK).json(posts);
    } catch (error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "카테고리별 게시판 조회중에 에러가 발생했습니다."});
    }
};


// 즉흥 게시판 상위 2개만 조회 - 지역 선택시 
export const get_top_post_by_local_controller = async(req,res,next) => {
    try {
        const local_id = parseInt(req.params.local_id);
        const top_posts_by_local = await get_top_post_by_local_service(local_id);

        res.status(StatusCodes.OK).json(top_posts_by_local);
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시판 상위 2개 조회(지역별) 중에 에러가 발생했습니다."});
    }
};

// 즉흥 게시판 상위 2개 조회 - 전체
export const get_top_controller = async(req, res) => {
    try {
        const top_posts = await get_top_post_service();
        res.status(StatusCodes.OK).json(top_posts);
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "게시판 상위 2개 조회(전체) 중에 에러가 발생했습니다."});
    }
};


// 인기 게시판 조회 
export const get_popular_posts_controller = async(req,res) => {
    try {
        const popular_posts = await get_popular_posts_service();
        res.status(StatusCodes.OK).json(popular_posts);
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "인기 게시판 조회중 에러가 발생했습니다."});
    }
}


// 특정 게시글 조회
export const get_post_by_id_controller = async(req,res,next) => {
    try{
        const post_id = parseInt(req.params.post_id);
        const post = await get_post_by_id_service(post_id);

        if(!post){
            return res.status(StatusCodes.NOT_FOUND).json({message: "게시글을 찾을 수 없습니다."});
        }

        res.status(StatusCodes.OK).json(post);
    } catch (error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "특정 게시물 조회 중에 에러가 발생했습니다."});
    }
};



// 내가 작성한 글 조회
export const get_my_posts_controller = async(req,res) => {
    const user_id = parseInt(req.params.user_id);
    try {
        const get_my_posts = await get_my_posts_service(user_id);

        if (get_my_posts.message) {
            return res.status(StatusCodes.OK).json(get_my_posts); 
        }
        res.status(StatusCodes.OK).json(get_my_posts);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "내가 작성한 글을 조회 중에 에러가 발생했습니다."});
    }
}



// 댓글 작성
export const create_comment_controller = async(req,res) => {
    try{
        const post_id = parseInt(req.params.post_id);
        const post_data = create_comment_dto(req.body);

        const comment = await create_comment_service(post_id, post_data);

        res.status(StatusCodes.CREATED).json(comment);
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "댓글 작성 중에 에러가 발생했습니다."});
    }

}

// 댓글 삭제
export const delete_comment_controller = async(req,res) => {
    try{
        const post_id = parseInt(req.params.post_id);
        const comment_id = parseInt(req.params.comment_id);

        const comment = await delete_comment_service(post_id, comment_id);

        if(comment){
            res.status(StatusCodes.OK).json(delete_comment_response_dto(post_id, comment_id));
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "존재하지 않는 게시물, 댓글 입니다."});
        }

    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "댓글 삭제 중에 에러가 발생했습니다."});
    }
}


// 좋아요 누르기
export const create_like_controller = async(req,res) => {
    try {
        const post_id = parseInt(req.params.post_id);
        const user_id = parseInt(req.params.user_id);

        const likeExists = await check_like_exist_repository(post_id, user_id);

        if (likeExists) {
            return res.status(400).json({ message: "이미 좋아요를 누른 게시글입니다." });
        }

        const like_key = await create_like_service(post_id, user_id);

        if(like_key) {
            res.status(StatusCodes.CREATED).json({message: "좋아요를 눌렀습니다.", like_key});
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "해당 게시글을 찾을 수 없습니다."}); 
        }
        
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "공감 중에 에러가 발생했습니다."});
    }
}

// 좋아요 취소하기 
export const delete_like_controller = async(req,res) => {
    try {
        const post_id = parseInt(req.params.post_id);
        const user_id = parseInt(req.params.user_id);

        const likeExists = await check_like_exist_repository(post_id,user_id);

        if(!likeExists){
            return res.status(400).json({message: "좋아요를 누르지 않았습니다."});
        } 
        const delete_like_key = await delete_like_service(post_id,user_id);

        if(delete_like_key) {
            res.status(StatusCodes.OK).json({message: "좋아요가 취소되었습니다.", delete_like_key});
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "해당 게시글을 찾을 수 없습니다."});
        }

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "좋아요 취소하는 중에 에러가 발생했습니다."}); 
    }
}


// 스크랩 누르기 
export const create_scrap_controller = async(req, res) => {
    const post_id = parseInt(req.params.post_id);
    const user_id = parseInt(req.params.user_id);

    try {
        const scrapExists = await check_scrap_exist_repository(post_id, user_id);

        if(scrapExists) {
            return res.status(400).json({message: "이미 스크랩을 눌렀습니다."});
        }
        const create_scrap_key = await create_scrap_service(post_id, user_id);

        if(create_scrap_key) {
            res.status(StatusCodes.CREATED).json({message: "해당 게시글이 스크랩 되었습니다.", create_scrap_key});
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "해당 게시글을 찾을 수 없습니다."});
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "스크랩 하는 중에 에러가 발생했습니다."});
    }
}


// 스크랩 삭제 
export const delete_scrap_controller = async(req,res) => {
    try {
        const post_id = parseInt(req.params.post_id);
        const user_id = parseInt(req.params.user_id);

        const scrapExists = await check_scrap_exist_repository(post_id, user_id);

        if(!scrapExists){
            return res.status(400).json({message: "스크랩 하지 않은 게시물 입니다."});
        } 
        const delete_scrap_key = await delete_scrap_service(post_id,user_id);

        if(delete_scrap_key) {
            res.status(StatusCodes.OK).json({message: "스크랩이 취소되었습니다.", delete_scrap_key});
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "해당 게시글을 찾을 수 없습니다."});
        }

    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "스크랩을 취소하는 중에 에러가 발생했습니다."}); 
    }
}


// 스크랩 조회
export const get_scrap_controller = async(req, res) => {
    const user_id = parseInt(req.params.user_id);
    try{
        const get_scrap = await get_scrap_service(user_id);

        if(get_scrap){
            res.status(StatusCodes.OK).json(get_scrap);
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "아직 스크랩한 게시글이 없습니다."});
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "스크랩 조회 중에 에러가 발생했습니다."});
    }
}


// 스크랩 조회 - 카테고리별 
export const get_scrap_by_category_controller = async(req,res) => {
    const user_id = parseInt(req.params.user_id);
    const category_id = parseInt(req.params.category_id);

    try {
        const get_scrap = await get_scrap_by_category_service(user_id, category_id);

        if(get_scrap) {
            res.status(StatusCodes.OK).json(get_scrap);
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "해당 카테고리와 관련된 글을 스크랩 하지 않았습니다."});
        }
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "카테고리별 스크랩 조회 중에 에러가 발생했습니다."});
    }
}