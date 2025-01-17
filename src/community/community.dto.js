
// 게시글 추가 요청 작성 DTO
export const create_post_dto = (data) => ({
    category_id: data.category_id, 
    user_id: data.user_id,         
    local_id: data.local_id,        
    title: data.title,           
    content: data.content,         
    status: data.status || 'ACTIVE', // 상태 (기본값 'ACTIVE')
    picture_url: data.picture_url || [],  // 이미지 URL 배열, 기본값은 빈 배열
});

// 게시글 추가 응답 DTO
export const create_post_response_dto = (response) => ({
    post_id: response.result.id,
    user_id: response.result.user_id,
    category_id: response.result.category_id,
    local_id: response.result.local_id,   
    title: response.result.title,
    content: response.result.content,
    images: response.result.picture_url || [],
    created_at: new Date(response.result.createdAt).toISOString(),
});



// 게시글 수정 요청 DTO
export const update_post_request_dto = (data, post_id) => ({
    post_id,
    category_id: data.categoryId,
    local_id: data.localId,
    title: data.title, 
    content: data.content,
    images: Array.isArray(data.images) ? data.images : []
});

// 게시글 수정 응답 DTO
export const update_post_response_dto = (response) => ({
    user_id: response.result.user_id,
    post_id: response.result.id,
    category_id: response.category_id,
    local_id: response.local_id,
    title: response.result.title,
    content: response.result.content,
    images: Array.isArray(response.result.images) ? response.result.images : [], 
    updated_at: new Date(response.result.updatedAt).toISOString(), 
});



// 게시글 삭제 응답 DTO
export const delete_post_response_dto = (post_id) => ({
    message: "게시글이 성공적으로 삭제되었습니다.",
    post_id, 
    status: "DELETED", 
});



// 최근 검색어(지역) => 추가 예정 



// 전체 게시글 조회 응답 DTO
export const get_all_posts_response_dto = (posts) => ({
    posts: posts.map(post => ({
        post_id: post.postId,
        title: post.title,
        content: post.content,
        created_at: new Date(post.created_at).toISOString(),
        like: post.like,
        comment: post.comment,
        scrap: post.scrap,
        local_id: post.local_id
    }))
});

// 카테고리별 게시글 조회 응답 DTO
export const get_posts_by_category_response_dto = (posts, category_id) => ({
    category_id,
    posts: posts.map(post => ({
        post_id: post.postId,
        title: post.title,
        content: post.content,
        created_at: new Date(post.created_at).toISOString(),
        like: post.like,
        comment: post.comment,
        scrap: post.scrap,
        local_id: post.local_id
    }))
});


// 즉흥 게시판 상위 2개 게시글 선택 응답 DTO
export const get_top_posts_response_dto = (responses, category_id) => {
    const top_posts = responses.slice(0, 2);

    return top_posts.map(response => ({
        category_id,
        title: response.title,
        content: response.content,
        like: response.like,
        comment: response.comment,
        scrap: response.scrap,
        local_id: response.local_id
    }));
};



// 인기 게시판 조회


// 댓글 DTO
export const get_comment_response_dto = (comment, user) => ({
    nickname: user.nickname,
    created_at: comment.createdAt,
    content: comment.content,
});



// 특정 게시물 조회 응답 DTO
export const get_post_by_id_response_dto = (response, post_id, users) => ({
    post_id,
    category_id: response.categoryId,
    nickname: response.nickname,
    created_at: response.createdAt,
    images: response.result.images || [],
    content: response.content,
    like: response.like,
    scrap: response.scrap,
    comments: response.comments.map(comment => get_comment_response_dto(comment, users[comment.userId])),
});

