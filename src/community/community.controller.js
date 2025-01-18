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

    create_comment_dto,

} from "./community.dto.js"

import {
    create_post_service,
    update_post_service,
    delete_post_service,
    get_all_posts_service,
    get_posts_by_category_service,
    get_top_post_service,
    get_post_by_id_service,

    create_comment_service,
    
} from "./community.service.js"


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
    try {
        const post_id = parseInt(req.params.post_id);
        const post_data = update_post_request_dto(req.body, post_id);
        const updated_post = await update_post_service(post_id, post_data);

        if(!updated_post){
            return res.status(StatusCodes.NOT_FOUND).json({message : "게시물을 찾을 수 없습니다."});
        }
        res.status(StatusCodes.OK).json(updated_post);
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시판 조회중에 에러가 발생했습니다."});
    }
};


// 즉흥 게시판 상위 2개만 조회
export const get_top_post_controller = async(req,res,next) => {
    try {
        const local_id = parseInt(req.params.local_id);
        const top_posts = await get_top_post_service(local_id);

        res.status(StatusCodes.OK).json(top_posts);
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시판 상위 2개 조회 중에 에러가 발생했습니다."});
    }
};




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
