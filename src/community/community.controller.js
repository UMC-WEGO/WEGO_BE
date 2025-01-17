import { StatusCodes } from 'http-status-codes'; 
import {
    CreatePostDto,
    CreatePostResponseDto,
    GetPostByIdResponseDto,
    UpdatePostRequestDto,
    DeletePostResponseDto,
    GetAllPostsResponseDto,
    GetPostsByCategoryResponseDto,
    GetTopPostsResponseDto,
    UpdatePostResponseDto,
} from "./community.dto.js"

import {
    createPostService,
    updatePostService,
    deletePostService,
    getAllPostsService,
    getPostsByCategoryService,
    getTopPostService,
    getPostByIdService,
} from "./community.service.js"


// 게시물 작성
export const createPostController = async(req,res,next) => {
    try {
        const postData = CreatePostDto(req.body);
        const newPost = await createPostService(postData);
        res.status(StatusCodes.CREATED).json(CreatePostResponseDto({ result: newPost }));
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "게시글 작성 중에 에러가 발생했습니다." });
    }
};


// 게시물 수정 
export const updatePostController = async(req,res,next) => {
    try {
        const postId = parseInt(req.params.postId);
        const postData = UpdatePostRequestDto(req.body, postId);
        const updatedPost = await updatePostService(postId, postData);

        if(!updatedPost){
            return res.status(StatusCodes.NOT_FOUND).json({message : "게시물을 찾을 수 없습니다."});
        }
        res.status(StatusCodes.OK).json(UpdatePostResponseDto({result: updatedPost}));
    } catch(error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시물 수정 중에 에러가 발생했습니다."});
    }
};


// 게시물 삭제
export const deletePostController = async(req,res,next) => {
    try {
        const postId = parseInt(req.params.postId);
        const result = await deletePostService(postId);

        if(result){
            res.status(StatusCodes.OK).json(DeletePostResponseDto(postId));
        } else {
            res.status(StatusCodes.NOT_FOUND).json({message: "게시물을 찾을 수 없습니다."});
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시물 삭제 중에 에러가 발생했습니다."});
    }
};


// 전체 글 조회 
export const getAllPostsController = async(req,res,next) => {
    try {
        const posts = await getAllPostsService();
        res.status(StatusCodes.OK).json(GetAllPostsResponseDto(posts));
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "전체 글 조회 중에 에러가 발생했습니다. "});
    }
};


// 카테고리별 글 조회
export const getPostsByCategoryController = async(req,res,next)=> {
    try{
        const categoryId = parseInt(req.params.categoryId);
        const posts = await getPostsByCategoryService(categoryId);

        res.status(StatusCodes.OK).json(GetPostsByCategoryResponseDto(posts,categoryId));
    } catch (error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시판 조회중에 에러가 발생했습니다."});
    }
};


// 즉흥 게시판 상위 2개만 조회
export const getTopPostController = async(req,res,next) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const posts = await getTopPostService(categoryId);
        const topPosts = GetTopPostsResponseDto(posts,categoryId);

        res.status(StatusCodes.OK).json({sucess: true, result : topPosts});
    } catch(error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "게시판 상위 2개 조회 중에 에러가 발생했습니다."});
    }
};

// 특정 게시물 조회
export const getPostByIdController = async(req,res,next) => {
    try{
        const postId = parseInt(req.params.postId);
        const post = await getPostByIdService(postId);

        if(!post){
            return res.status(StatusCodes.NOT_FOUND).json({message: "게시글을 찾을 수 없습니다."});
        }

        res.status(StatusCodes.OK).json(GetPostByIdResponseDto(post, postId, {}));
    } catch (error){
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message : "특정 게시물 조회 중에 에러가 발생했습니다."});
    }
};