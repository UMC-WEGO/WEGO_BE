// src/utils/jwt.utils.js
import jwt from "jsonwebtoken";

// 환경 변수 검사 및 설정
const { JWT_PUBLIC_KEY, JWT_PRIVATE_KEY, JWT_REFRESH_SECRET } = process.env;
if (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY || !JWT_REFRESH_SECRET) {
    throw new Error("JWT_PRIVATE_KEY, JWT_PUBLIC_KEY 또는 JWT_REFRESH_SECRET이 누락되었습니다.");
}

// 에러 메시지 상수
const ERROR_MESSAGES = {
    MISSING_OR_INVALID_AUTH_HEADER: "Authorization 헤더가 없거나 형식이 잘못되었습니다.",
    INVALID_USER_ID: "유효하지 않은 user_id 입니다.",
};

// Authorization 헤더에서 토큰 추출
const extractTokenFromHeader = (req) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error(ERROR_MESSAGES.MISSING_OR_INVALID_AUTH_HEADER);
    }
    return authHeader.split(" ")[1];
};

// 토큰 생성 함수 (Access Token / Refresh Token)
const createToken = (payload, secretOrPrivateKey, expiresIn) => {
    return jwt.sign(payload, secretOrPrivateKey, { expiresIn });
};

// 토큰 생성 함수 (전체)
const generateTokens = (user_id) => {
    if (!user_id || typeof user_id !== "number") {
        throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }

    const payload = { id: user_id };
    return {
        accessToken: createToken(payload, JWT_PRIVATE_KEY, "7d"),
        refreshToken: createToken(payload, JWT_REFRESH_SECRET, "30d"),
    };
};

// 토큰 검증 함수
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_PUBLIC_KEY);  // JWT_PUBLIC_KEY를 사용하여 검증
    } catch (error) {
        throw new Error("유효하지 않은 토큰입니다.");
    }
};

export { extractTokenFromHeader, generateTokens, verifyToken };
