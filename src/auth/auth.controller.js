// src/auth/auth.controller.js

import { response } from '../../config/response.js';
import { 
  signUp,
  login,
  checkNickname,
  checkEmail,
  refreshTokens,
  deleteUser,
  logout,
  sendEmailVerificationCode,
  verifyEmailAuthCode,
  sendPasswordVerificationCode,
  verifyPasswordAuthCode,
  changePasswordService
} from './auth.service.js';
import { SignUpDto, LoginDto } from './auth.dto.js';
import { findUserByEmail } from './auth.repository.js';

export const signUpController = async (req, res) => {
  try {
    
    const { email, password, nickname, marketing_consent, info_consent } = req.body;

    const signUpDto = new SignUpDto(email, password, nickname, marketing_consent, info_consent);

    const newUser = await signUp(signUpDto);

    const result = response(
      { isSuccess: true, code: 200, message: '회원가입 성공' },
      newUser
    );
    return res.status(200).json(result);
  } catch (error) {
    const result = response(
      { isSuccess: false, code: 400, message: error.message || '잘못된 요청입니다.' },
      null
    );
    return res.status(400).json(result);
  }
};


export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const loginDto = new LoginDto(email, password);

    const tokens = await login(loginDto);

    const result = response(
      { isSuccess: true, code: 200, message: '로그인 성공' },
      {
        refreshToken: tokens.refreshToken,
      }
    );


    res.header('Authorization', `Bearer ${tokens.accessToken}`);

    return res.status(200).json(result);
  } catch (error) {
    const result = response(
      { isSuccess: false, code: 400, message: error.message || '잘못된 요청입니다.' },
      null
    );
    return res.status(400).json(result);
  }
};

export const nicknameCheckController = async (req, res) => {
  try {
    const { nickname } = req.body;
    const result = await checkNickname(nickname);

    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message }
    );
    return res.status(200).json(responseResult);
    
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 409, message: error.message }
    );
    return res.status(409).json(responseResult);
  }
};

export const emailCheckController = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await checkEmail(email);
    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message }
    );
    return res.status(200).json(responseResult);
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 409, message: error.message }
    );
    return res.status(409).json(responseResult);
  }
};

export const refreshController = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error('리프레시 토큰이 제공되지 않았습니다.');
    }

    const tokens = await refreshTokens(refreshToken);

    res.header('Authorization', `Bearer ${tokens.accessToken}`);

    const result = response(
      { isSuccess: true, code: 200, message: '토큰 재발급 성공' },
      {
        refreshToken: tokens.refreshToken,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    const result = response(
      { isSuccess: false, code: 400, message: error.message || '잘못된 요청입니다.' }
    );

    return res.status(400).json(result);
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const { user_id } = req;

    const result = await deleteUser(user_id);

    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message }
    );
    return res.status(200).json(responseResult);
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 400, message: error.message || '잘못된 요청입니다.' }
    );
    return res.status(400).json(responseResult);
  }
};

export const logoutController = async (req, res) => {
  try {
    const { user_id } = req;  
    
    const result = await logout(user_id);

    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message }
    );
    
    return res.status(200).json(responseResult);
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 400, message: error.message || '로그아웃 처리 중 오류가 발생했습니다.' }
    );
    return res.status(400).json(responseResult);
  }
};


export const sendEmailAuthController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error('이메일이 제공되지 않았습니다.');
    }

    await sendEmailVerificationCode(email);

    const responseResult = response(
      { isSuccess: true, code: 200, message: '인증 코드가 전송되었습니다.' }
    );

    return res.status(200).json(responseResult);

  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: error.message === '이미 사용 중인 이메일입니다.' ? 409 : 400, message: error.message || '잘못된 요청입니다.' }
    );
    return res.status(responseResult.code).json(responseResult);
  }
};


export const verifyEmailAuthController = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      const responseResult = response(
        { isSuccess: false, code: 400, message: '이메일과 인증 코드가 필요합니다.' }
      );
      return res.status(400).json(responseResult);
    }

    const isVerified = await verifyEmailAuthCode(email, code);

    if (isVerified) {
      const responseResult = response(
        { isSuccess: true, code: 200, message: '인증 코드가 유효합니다.' }
      );
      return res.status(200).json(responseResult);
    } else {
  
      const responseResult = response(
        { isSuccess: false, code: 401, message: '잘못된 인증 코드입니다.' }
      );
      return res.status(401).json(responseResult);
    }
  } catch (error) {

    if (error.message === '인증 코드가 만료되었습니다.') {
      const responseResult = response(
        { isSuccess: false, code: 408, message: '인증 코드가 만료되었습니다.' }
      );
      return res.status(408).json(responseResult);
    }

    const responseResult = response(
      { isSuccess: false, code: 500, message: error.message || '서버 오류가 발생했습니다.' }
    );
    return res.status(500).json(responseResult);
  }
};

export const sendPasswordAuthController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error('이메일이 제공되지 않았습니다.');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    await sendPasswordVerificationCode(email);

    const responseResult = response(
      { isSuccess: true, code: 200, message: '인증 코드가 전송되었습니다.' }
    );

    return res.status(200).json(responseResult);

  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 400, message: '잘못된 요청입니다.' }
    );
    return res.status(400).json(responseResult);
  }
};


export const verifyPasswordAuthController = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (!email || !code) {
      const responseResult = response(
        { isSuccess: false, code: 400, message: '잘못된 요청입니다.' }
      );
      return res.status(400).json(responseResult);
    }

    const isVerified = await verifyPasswordAuthCode(email, code);

    if (isVerified) {
      const responseResult = response(
        { isSuccess: false, code: 200, message: '인증 코드가 일치합니다.' }
      );
      return res.status(200).json(responseResult);
    } else {
  
      const responseResult = response(
        { isSuccess: false, code: 401, message: '잘못된 인증 코드입니다.' }
      );
      return res.status(401).json(responseResult);
    }
  } catch (error) {

    if (error.message === '인증 코드가 만료되었습니다.') {
      const responseResult = response(
        { isSuccess: false, code: 408, message: '인증 코드가 만료되었습니다.' }
      );
      return res.status(408).json(responseResult);
    }

    const responseResult = response(
      { isSuccess: false, code: 400, message: '잘못된 요청입니다.' }
    );
    return res.status(400).json(responseResult);
  }
};


export const passwordChangeController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const responseResult = response(
        { isSuccess: false, code: 400, message: '잘못된 요청입니다.' }
      );
      return res.status(400).json(responseResult);
    }

    await changePasswordService(email, password);

    const responseResult = response(
      { isSuccess: true, code: 200, message: "패스워드 변경 성공" }
    );
    
    return res.status(200).json(responseResult);


  } catch (error) {
    console.error('비밀번호 변경 오류:', error.message);
    return res.status(500).json({ message: error.message || '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};