
import express from "express";
import {
    create_post_controller,
    update_post_controller,
    delete_post_controller,
    get_all_posts_controller,
    get_posts_by_category_controller,
    get_top_post_controller,
    get_post_by_id_controller,

    create_comment_controller,
} from './community.controller.js'

const communityRouter = express.Router();

communityRouter.get("/", (req, res) => {
    res.send("community main route");
});

//게시글 작성
communityRouter.post("/posts", create_post_controller);

// 게시글 수정
communityRouter.put("/posts/modify/:post_id", update_post_controller);

//게시글 삭제
communityRouter.delete("/posts/delete/:post_id", delete_post_controller);

//전체 게시글 조회
communityRouter.get("/impromptu-posts", get_all_posts_controller);

// 카테고리별 게시글 조회 
communityRouter.get("/impromptu-posts/:category_id", get_posts_by_category_controller);

// 상위 2개 게시물 조회 - 지역 선택시
communityRouter.get("/impromptu-posts/top/:local_id", get_top_post_controller);

// 인기 게시판 조회
//communityRouter("/popular-posts",);

//특정 게시물 조회
communityRouter.get("/posts/:post_id", get_post_by_id_controller);


// 댓글 작성 
communityRouter.post("/posts/:post_id/comments", create_comment_controller);

export default communityRouter;