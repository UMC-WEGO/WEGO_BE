import jwt from 'jsonwebtoken';
import { response } from './response.js';

const { JWT_SECRET } = process.env;


const createErrorResponse = (message, code = 401) => response(
    { isSuccess: false, code, message },
    {}
);


const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret); 
    } catch (err) {
        if (err.name === 'TokenExpiredError') throw new Error('토큰이 만료되었습니다');
        throw new Error('유효하지 않은 토큰입니다');
    }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(createErrorResponse('Authorization 헤더가 없거나 형식이 잘못되었습니다'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token, JWT_SECRET);
        req.userId = decoded.id; 
        console.log("Authenticated userId:", req.userId);
        next(); 
    } catch (err) {
        return res.status(401).json(createErrorResponse(err.message));
    }
};

export default authenticateToken;
