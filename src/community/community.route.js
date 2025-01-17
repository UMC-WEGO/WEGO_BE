
import express from "express";
import {
    createPostController,
    updatePostController,
    deletePostController,
    getAllPostsController,
    getPostsByCategoryController,
    getTopPostController,
    getPostByIdController,
} from './community.controller.js'

const communityRouter = express.Router();

communityRouter.get("/", (req, res) => {
    res.send("community main route");
});

//게시글 추가
communityRouter.post("/posts",createPostController);

// 게시글 수정
communityRouter.put("/posts/modify/:postId",updatePostController);

//게시글 삭제
communityRouter.delete("/posts/delete/:postId",deletePostController);

//전체 게시글 조회
communityRouter.get("/impromptu-posts",getAllPostsController);

// 카테고리별 게시글 조회 
communityRouter.get("/impromptu-posts/:categoryId",getPostsByCategoryController);

// 상위 2개 게시물 조회
communityRouter.get("/impromptu-posts/top",getTopPostController);

// 인기 게시판 조회
//communityRouter("/popular-posts",);

//특정 게시물 조회
communityRouter.get("/posts/:postId",getPostByIdController);


export default communityRouter;