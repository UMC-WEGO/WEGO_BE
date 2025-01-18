// src/utils/jwt.utils.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 환경 변수 체크
const { JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, JWT_REFRESH_SECRET } = process.env;

if (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY || !JWT_REFRESH_SECRET) {
    throw new Error("환경 변수 JWT_PRIVATE_KEY, JWT_PUBLIC_KEY 또는 JWT_REFRESH_SECRET이 누락되었습니다.");
}

// 에러 메시지 상수
const ERROR_MESSAGES = {
    MISSING_OR_INVALID_AUTH_HEADER: "Authorization 헤더가 없거나 형식이 잘못되었습니다.",
    INVALID_USER_ID: "유효하지 않은 user_id 입니다.",
    MISSING_SECRET_KEY: "비밀 키가 누락되었습니다. JWT_PRIVATE_KEY 또는 JWT_REFRESH_SECRET을 확인하십시오.",
    INVALID_TOKEN: "유효하지 않은 토큰입니다."
};

// 비밀 키 또는 공개 키가 없는 경우 오류 발생
const checkKeyAvailability = (key, keyName) => {
    if (!key) {
        throw new Error(`${keyName}이(가) 누락되었습니다.`);
    }
};

// JWT 토큰 생성 함수
const createToken = (payload, secretOrPrivateKey, expiresIn) => {
    checkKeyAvailability(secretOrPrivateKey, '비밀 키');
    return jwt.sign(payload, secretOrPrivateKey, { algorithm: 'ES256', expiresIn });
};

// 토큰 생성 함수 (전체)
const generateTokens = (user_id) => {
    if (!user_id || typeof user_id !== 'number') {
        throw new Error(ERROR_MESSAGES.INVALID_USER_ID);
    }

    const payload = { id: user_id };
    return {
        accessToken: createToken(payload, JWT_PRIVATE_KEY, '7d'),  // Access Token
        refreshToken: createToken(payload, JWT_PRIVATE_KEY, '30d')  // Refresh Token
    };
};

// 토큰 검증 함수
const verifyToken = (token) => {
    if (!JWT_PUBLIC_KEY) {
        throw new Error(ERROR_MESSAGES.MISSING_SECRET_KEY);
    }

    try {
        return jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['ES256'] });
    } catch (error) {
        console.error("JWT Token verification failed:", error.message);
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }
};

export { generateTokens, verifyToken };
