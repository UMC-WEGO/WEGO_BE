// src/auth/auth.dto.js

import { refreshTokens } from "./auth.service.js";

export class SignUpDto {
    constructor(email, password, nickname, marketing_consent, info_consent) {
      this.email = email;
      this.password = password;
      this.nickname = nickname;
      this.marketing_consent = marketing_consent;
      this.info_consent = info_consent;
    }
  }

export class LoginDto {
    constructor(email, password) {
      this.email = email;
      this.password = password;
    }
  }

// 회원가입 응답 DTO
export const signUpResponseDTO = (message) => ({
  message,
});

// 로그인 응답 DTO
export const loginResponseDTO = (refreshToken) => ({
  message : "로그인 성공",
  refreshToken
});

// 닉네임&이메일 중복 검사 응답 DTO
export const checkResponseDTO = (message) => ({
  message,
});

// 인증 코드 요청 응답 DTO
export const sendAuthCodeResponseDTO = (message) => ({
  message,
});

// 인증 코드 검증 응답 DTO
export const verifyAuthCodeResponseDTO = (message) => ({
  message,
});

// 토큰 재발급 응답 DTO
export const refreshTokenResponseDTO = (refreshToken) => ({
  message : "토큰 재발급 성공",
  refreshToken
});

// 회원 탈퇴 응답 DTO
export const deleteUserResponseDTO = (message) => ({
  message,
});

// 로그아웃 응답 DTO
export const logoutResponseDTO = (message) => ({
  message,
});

// 비밀번호 변경하기 응답 DTO
export const changePasswordResponseDTO = (message) => ({
  message,
});