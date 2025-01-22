
import express from "express";
import {
    create_post_controller,
    update_post_controller,
    delete_post_controller,
    get_all_posts_controller,
    get_posts_by_category_controller,
    get_top_controller,
    get_top_post_by_local_controller,

    get_popular_posts_controller,
    
    get_post_by_id_controller,

    get_my_posts_controller,

    create_comment_controller,
    delete_comment_controller,

    create_like_controller,
    delete_like_controller,

    create_scrap_controller,
    delete_scrap_controller,
    get_scrap_controller,
    get_scrap_by_category_controller,

} from './community.controller.js'

const communityRouter = express.Router();

communityRouter.get("/", (req, res) => {
    res.send("community main route");
});

//게시글 작성
communityRouter.post("/posts", create_post_controller);

// 게시글 수정
communityRouter.patch("/posts/modify/:post_id", update_post_controller);

//게시글 삭제
communityRouter.delete("/posts/delete/:post_id", delete_post_controller);


//전체 게시글 조회
communityRouter.get("/impromptu-posts", get_all_posts_controller);

// 카테고리별 게시글 조회 
communityRouter.get("/impromptu-posts/:category_id", get_posts_by_category_controller);

// 상위 2개 게시물 조회 - 지역 선택시
communityRouter.get("/impromptu-posts/top-local/:local_id", get_top_post_by_local_controller);

// 상위 2개 게시물 조회 - 전체 
communityRouter.get("/posts/top", get_top_controller);


// 인기 게시판 조회
communityRouter.get("/popular-posts",get_popular_posts_controller);


//특정 게시물 조회
communityRouter.get("/posts/:post_id", get_post_by_id_controller);


// 내가 쓴 글 조회 
communityRouter.get("/my-posts/:user_id", get_my_posts_controller);


// 댓글 작성 
communityRouter.post("/posts/:post_id/comments", create_comment_controller);

// 댓글 삭제
communityRouter.delete("/posts/:post_id/comments/:comment_id", delete_comment_controller);


// 좋아요 누르기
communityRouter.post("/posts/:post_id/likes/:user_id", create_like_controller);

// 좋아요 삭제 
communityRouter.delete("/delete/:post_id/likes/:user_id", delete_like_controller);


// 스크랩 누르기
communityRouter.post("/posts/:post_id/scrap/:user_id", create_scrap_controller);

// 스크랩 삭제 
communityRouter.delete("/delete/:post_id/scrap/:user_id", delete_scrap_controller);

// 스크랩 조회
communityRouter.get("/my-scraps/:user_id", get_scrap_controller);

// 스크랩 조회 - 카테고리별 
communityRouter.get("/my-scraps/:user_id/category/:category_id",get_scrap_by_category_controller);


export default communityRouter;