// src/auth/auth.controller.js

import { response } from '../../config/response.js';
import { 
  signUp,
  login,
  checkNickname,
  checkEmail,
  refreshTokens,
  deleteUser,
  logout 
} from './auth.service.js';
import { SignUpDto, LoginDto } from './auth.dto.js';

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
      { isSuccess: false, code: 401, message: error.message || '잘못된 요청입니다.' },
      null
    );

    return res.status(401).json(result);
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

    const result = response(
      { isSuccess: true, code: 200, message: '토큰 재발급 성공' },
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



export const deleteUserController = async (req, res) => {
  try {
    const { user_id } = req;

    const result = await deleteUser(user_id);

    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message },
      null
    );
    return res.status(200).json(responseResult);
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 400, message: error.message || '잘못된 요청입니다.' },
      null
    );
    return res.status(400).json(responseResult);
  }
};

export const logoutController = async (req, res) => {
  try {
    const { user_id } = req;  
    
    const result = await logout(user_id);

    const responseResult = response(
      { isSuccess: true, code: 200, message: result.message },
      null
    );
    
    return res.status(200).json(responseResult);
  } catch (error) {
    const responseResult = response(
      { isSuccess: false, code: 400, message: error.message || '로그아웃 처리 중 오류가 발생했습니다.' },
      null
    );
    return res.status(400).json(responseResult);
  }
};

