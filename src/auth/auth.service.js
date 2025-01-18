// src/auth/auth.service.js

import { 
    createUser,
    findUserByEmail,
    updateUserRefreshToken,
    findUserByNickname,
    findUserByRefreshToken 
    } from './auth.repository.js';
import { generateTokens, verifyToken} from '../utils/jwt.utils.js';
import bcrypt from 'bcrypt';

export const signUp = async (signUpDto) => {
  const { email, password, nickname, marketing_consent, info_consent } = signUpDto;

  console.log('Password before hash: ', password); 

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await createUser({ 
    email, 
    password: hashedPassword, 
    nickname, 
    marketing_consent, 
    info_consent, 
  });

  return newUser;
};

export const login = async (loginDto) => {
  const { email, password } = loginDto;

  try {

    // 사용자 조회
    const user = await findUserByEmail(email);

    if (!user) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    // 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    // 토큰 생성
    const tokens = generateTokens(user.id);

    // RefreshToken을 User 테이블에 저장
    await updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    console.error('로그인 에러:', error.message);
    throw error;
  }
};


export const checkNickname = async (nickname) => {
  try {
    const existingUser = await findUserByNickname(nickname);
    if (existingUser) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }
    return { message: '사용 가능한 닉네임입니다.' };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const checkEmail = async (email) => {
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }
    return { message: '사용 가능한 이메일입니다.' };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const refreshTokens = async (refreshToken) => {
  try {
    // verifyToken 함수 사용
    const decoded = verifyToken(refreshToken);

    const user = await findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('유효하지 않은 리프레시 토큰입니다.');
    }

    // 새 토큰 생성
    const tokens = generateTokens(user.id);

    // 새 리프레시 토큰 저장
    await updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    console.error('토큰 재발급 에러:', error.message);
    throw new Error('리프레시 토큰 검증 중 오류가 발생했습니다.');
  }
};
