// src/auth/auth.controller.js

import { response } from '../../config/response.js';
import { signUp, login } from './auth.service.js';
import { SignUpDto, LoginDto, RefreshDto, NicknameCheckDTO, EmailCheckDTO } from './auth.dto.js';

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

// src/auth/auth.controller.js

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
