import { getMissionDetailService, getMissionService, getPastTripsService, getUserPostService, getUserProfileService } from "./user.service.js";

// 사용자 프로필 조회
export const getUserInfoController = async (req, res) => {
  const user_id = req.user_id;

  if (!user_id) {
    return res.status(400).json({
      isSuccess: false,
      code: 400,
      message: "userId가 필요합니다.",
    });
  }

  try {
    const result = await getUserProfileService(user_id);

    if (result.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        code: 404,
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "사용자 정보 조회 성공",
      result: result,
    });
  } catch (error) {
    console.error("사용자 정보 조회 중 컨트롤러 오류: ", error);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "사용자 정보 조회 중 서버 오류 발생",
    });
  }
};

// 지난 여행 조회
export const getPastTripsController = async (req, res) => {
  try {
    const user_id = req.user_id;
    const result = await getPastTripsService(user_id);

    if (!result) {
      return res.status(404).json({
        isSuccess: false,
        code: 404,
        message: "지난 여행 일정이 없습니다.",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "지난 여행 조회 성공",
      result: result,
    });
  } catch (error) {
    console.error("지난 여행 조회 중 컨트롤러 오류 발생", error);
    return res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "지난 여행 조회 중 서버 오류 발생",
    });
  }
};

// 사용자 작성 게시글 조회
export const getUserPostController = async (req, res) => {
  try {
    const user_id = req.user_id;
    const result = await getUserPostService(user_id);

    if (!result) {
      return res.status(404).json({
        isSuccess: false,
        code: 404,
        message: "사용자가 작성한 게시글이 없습니다.",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "사용자 작성 게시글 조회 성공",
      result: result,
    });
  } catch (error) {
    console.error("사용자 작성 게시글 조회 중 컨트롤러 오류 발생", error);
    return res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "사용자 작성 게시글 조회 중 서버 오류 발생",
    });
  }
}

// 저장한 미션 조회
export const getMissionController = async (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      return res.status(500).json({
        isSuccess: false,
        code: 500,
        message: "userId가 존재하지 않습니다.",
      });
    }

    const missions = await getMissionService(user_id);
    return res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "저장한 미션 조회 성공",
      result: missions,
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "저장한 미션 조회 중 오류 발생"
    });
  }
}

// 미션 상세 조회
export const getMissionDetailController = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { tripId, missionId } = req.params;

    if (!user_id) {
      return res.status(400).json({
        isSuccess: false,
        code: 500,
        message: "userId가 존재하지 않습니다.",
      });
    }

    if (!tripId) {
      return res.status(400).json({
        isSuccess: false,
        code: 400,
        message: "travel_id가 존재하지 않습니다.",
      });
    }

    if (!missionId) {
      return res.status(400).json({
        isSuccess: false,
        code: 400,
        message: "mission_id가 존재하지 않습니다.",
      });
    }

    const missionDetail = await getMissionDetailService(user_id, tripId, missionId);
    console.log("미션 상세 조회 컨트롤러 호출", missionDetail);
    
    return res.status(200).json({
      isSuccess: true,
      code: 200,
      message: "미션 상세 조회 성공",
      result: missionDetail,
    });
  } catch (error) {
    console.error("미션 상세 조회 오류 발생", error);
    res.status(500).json({
      isSuccess: false,
      code: 500,
      message: "미션 상세 조회 중 서버 오류 발생",
    });
  }
};