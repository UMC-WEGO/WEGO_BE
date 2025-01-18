// src/auth/auth.service.js

import { createUser, findUserByEmail, updateUserRefreshToken } from './auth.repository.js';
import { generateTokens } from '../utils/jwt.utils.js';
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
    console.log('로그인 요청 데이터:', loginDto);

    // 사용자 조회
    const user = await findUserByEmail(email);
    console.log('조회된 사용자:', user);

    if (!user) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    // 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 일치 여부:', isPasswordValid);

    if (!isPasswordValid) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    // 토큰 생성
    const tokens = generateTokens(user.id);
    console.log('생성된 토큰:', tokens);

    // RefreshToken을 User 테이블에 저장
    await updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    console.error('로그인 에러:', error.message);
    throw error;
  }
};