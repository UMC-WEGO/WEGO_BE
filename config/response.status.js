import { StatusCodes } from "http-status-codes";

export const status = {
  // success
  SUCCESS: {
    status: StatusCodes.OK,
    isSuccess: true,
    code: 200,
    message: "요청 성공",
  },
  INTERNAL_SERVER_ERROR: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    isSuccess: false,
    code: "500",
    message: "서버 에러, 관리자에게 문의 바랍니다.",
  },
  BAD_REQUEST: {
    status: StatusCodes.BAD_REQUEST,
    isSuccess: false,
    code: "400",
    message: "잘못된 요청입니다.",
  },
  UNAUTHORIZED: {
    status: StatusCodes.UNAUTHORIZED,
    isSuccess: false,
    code: "401",
    message: "권한이 잘못되었습니다.",
  }
}