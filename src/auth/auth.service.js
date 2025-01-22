// src/auth/auth.service.js

import { 
    createUser,
    findUserByEmail,
    updateUserRefreshToken,
    findUserByNickname,
    findUserByRefreshToken,
    deactivateUserById,
    createAuthCode,
    findAuthCodeByEmail,
    deactivateAuthCode,
    updateUserPassword
    } from './auth.repository.js';
import { generateTokens, verifyToken } from '../utils/jwt.utils.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

export const signUp = async (signUpDto) => {
  const { email, password, nickname, marketing_consent, info_consent } = signUpDto;

  console.log('Password before hash: ', password); 

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

    const user = await findUserByEmail(email);

    if (!user) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    console.log('Input password:', password); // 사용자가 입력한 비밀번호
    console.log('Stored hashed password:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log('Password is valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new Error('잘못된 이메일 또는 비밀번호입니다.');
    }

    const tokens = generateTokens(user.id);

    await updateUserRefreshToken(user.id, tokens.refreshToken);
    console.log('Generated tokens:', tokens);

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

    const decoded = verifyToken(refreshToken);

    const user = await findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('유효하지 않은 리프레시 토큰입니다.');
    }

    const tokens = generateTokens(user.id);

    await updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    console.error('토큰 재발급 에러:', error.message);
    throw new Error('리프레시 토큰 검증 중 오류가 발생했습니다.');
  }
};

export const deleteUser = async (userId) => {
  try {
    await deactivateUserById(userId);
    return { message: '회원탈퇴 성공' };
  } catch (error) {
    throw new Error(error.message || '회원탈퇴 처리 중 오류가 발생했습니다.');
  }
};

export const logout = async (user_id) => {
  try {

    await updateUserRefreshToken(user_id, null);

    return { message: '로그아웃 성공' };
  } catch (error) {
    console.error('로그아웃 에러:', error.message);
    throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
  }
};

export const sendEmailVerificationCode = async (email) => {

  const existingUser = await findUserByEmail(email);
  console.log(existingUser)
  if (existingUser) {
    
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  const verificationCode = generateVerificationCode();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 3);

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[위고] 이메일 본인인증',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="color: #2196F3;">본인인증을 위해 아래 인증번호를 입력해 주세요.</h2>
          <div style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; padding: 10px; background-color: #f1f1f1; display: inline-block; border-radius: 5px;">
            인증번호: <span style="color: #1976D2;">${verificationCode}</span>
          </div>
          <p style="margin-top: 20px; color: #777;">감사합니다 😊</p>
          <p style="color: #888; font-size: 14px;">[위고] 팀 드림</p>
        </div>
      </div>
    `,
  };

  try {

    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);

    await createAuthCode({
      email,
      code: verificationCode,
      purpose: 'EMAIL_VERIFICATION',
      expires_at: expiresAt,
    });

  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('이메일 전송 중 오류가 발생했습니다.');
  }
};


export const verifyEmailAuthCode = async (email, code) => {

  const authCode = await findAuthCodeByEmail(email, code);

  if (!authCode) {
    throw new Error('인증 코드가 일치하지 않습니다.');
  }

  const currentDate = new Date();
  const codeExpirationDate = new Date(authCode.expires_at);

  if (currentDate > codeExpirationDate) {
    await deactivateAuthCode(authCode.id);
    throw new Error('인증 코드가 만료되었습니다.');
  }

  await deactivateAuthCode(authCode.id);

  return true;
};

export const sendPasswordVerificationCode = async (email) => {

  const verificationCode = generateVerificationCode();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 3);

  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[위고] 비밀번호 찾기',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="color: #2196F3;">비밀번호를 찾기 위해 아래 인증번호를 입력해 주세요.</h2>
          <div style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; padding: 10px; background-color: #f1f1f1; display: inline-block; border-radius: 5px;">
            인증번호: <span style="color: #1976D2;">${verificationCode}</span>
          </div>
          <p style="margin-top: 20px; color: #777;">감사합니다 😊</p>
          <p style="color: #888; font-size: 14px;">[위고] 팀 드림</p>
        </div>
      </div>
    `,
  };
  
  try {

    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);

    await createAuthCode({
      email,
      code: verificationCode,
      purpose: 'PASSWORD_RESET',
      expires_at: expiresAt,
    });

  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('이메일 전송 중 오류가 발생했습니다.');
  }
};

export const verifyPasswordAuthCode = async (email, code) => {

  const authCode = await findAuthCodeByEmail(email, code);

  if (!authCode) {
    throw new Error('인증 코드가 일치하지 않습니다.');
  }

  const currentDate = new Date();
  const codeExpirationDate = new Date(authCode.expires_at);

  if (currentDate > codeExpirationDate) {
    await deactivateAuthCode(authCode.id);
    throw new Error('인증 코드가 만료되었습니다.');
  }

  await deactivateAuthCode(authCode.id);

  return true;
};

export const changePasswordService = async (email, newPassword) => {

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }


  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUserPassword(user.id, hashedPassword);

};