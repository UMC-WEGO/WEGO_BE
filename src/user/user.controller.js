import { getUserProfileService } from "./user.service.js";

export const getUserInfoController = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      isSuccess: false,
      code: 400,
      message: "userId가 필요합니다.",
    });
  }

  try {
    const result = await getUserProfileService(userId);

    if (!result) {
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