import jwt from 'jsonwebtoken';
import { response } from './response.js';
import dotenv from 'dotenv'; 

dotenv.config(); 

const { JWT_PUBLIC_KEY } = process.env;

const createErrorResponse = (message, code = 401) => response(
    { isSuccess: false, code, message },
    {}
);

const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        console.error('Token Verification Error:', err);  // 에러 로그 추가
        if (err.name === 'TokenExpiredError') throw new Error('토큰이 만료되었습니다');
        throw new Error('유효하지 않은 토큰입니다');
    }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);  // 헤더 로그 추가

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(createErrorResponse('Authorization 헤더가 없거나 형식이 잘못되었습니다'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token, JWT_PUBLIC_KEY);  // 공개 키로 검증
        req.user_id = decoded.id; 
        console.log("Authenticated userId:", req.user_id);  // 디코딩된 userId 확인
        next(); 
    } catch (err) {
        return res.status(401).json(createErrorResponse(err.message));
    }
};

export default authenticateToken;
