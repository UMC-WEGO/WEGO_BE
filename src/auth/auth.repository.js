// src/auth/auth.repository.js
import { pool } from "../../config/db.config.js";

export const createUser = async (signUpDto) => {
  const { email, password, nickname, marketing_consent, info_consent } = signUpDto;

  const query = `
    INSERT INTO User (email, password, nickname, marketing_consent, info_consent)
    VALUES (?, ?, ?, ?, ?);
  `;

  const values = [email, password, nickname, marketing_consent, info_consent];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
};

export const verifyEmail = async (email) => {
  const query = `
    SELECT * 
    FROM Auth_codes 
    WHERE email = ? AND purpose = 'EMAIL_VERIFICATION' AND is_used = 1;
  `;

  try {
    const [rows] = await pool.query(query, [email]);
    return rows[0]; // 조건에 맞는 레코드가 있으면 true 반환
  } catch (error) {
    throw new Error('이메일 인증 확인 중 오류가 발생했습니다.');
  }
};

export const findUserByEmail = async (email) => {
  const query = `SELECT * FROM User WHERE email = ?`;
  const values = [email];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0];
  } catch (error) {

    throw new Error('이메일 검사 중 오류가 발생했습니다.');
  }
};

export const updateUserRefreshToken = async (user_id, refreshToken) => {
  const query = `
    UPDATE User
    SET refreshToken = ?
    WHERE id = ?;
  `;
  const values = [refreshToken, user_id];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error('리프레시 토큰 저장 중 오류가 발생했습니다.');
  }
};


export const findUserByNickname = async (nickname) => {
  const query = `SELECT * FROM User WHERE nickname = ?`;
  const values = [nickname];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0]; // Return the user if found
  } catch (error) {
    throw new Error('닉네임 중복 검사 중 오류가 발생했습니다.');
  }
};

export const findUserByRefreshToken = async (refreshToken) => {
  const query = `SELECT * FROM User WHERE refreshToken = ?`;
  const values = [refreshToken];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    throw new Error('리프레시 토큰 조회 중 오류가 발생했습니다.');
  }
};

export const findUserById = async (user_id) => {
  const query = `SELECT * FROM User WHERE id = ?`;
  const values = [user_id];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0]; 
  } catch (error) {
    throw new Error('사용자 조회 중 오류가 발생했습니다.');
  }
};


export const deactivateUserById = async (user_id) => {
  const query = `
    UPDATE User 
    SET status = 'INACTIVE', nickname = '탈퇴한 사용자', refreshToken = NULL 
    WHERE id = ?;
  `;
  const values = [user_id];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error('회원 탈퇴 중 오류가 발생했습니다.');
  }
};

export const createAuthCode = async ({ email, code, purpose, expires_at }) => {
  const query = `
    INSERT INTO Auth_codes (email, code, purpose, expires_at)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await pool.query(query, [email, code, purpose, expires_at]);
  } catch (error) {
    throw new Error('인증 코드 저장 중 오류가 발생했습니다.');
  }
};

export const findAuthCodeByEmail = async (email, code) => {
  const query = `
    SELECT * FROM Auth_codes 
    WHERE email = ? AND code = ? 
    ORDER BY expires_at DESC LIMIT 1;
  `;
  const values = [email, code];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0]; 
  } catch (error) {
    throw new Error('인증 코드 조회 중 오류가 발생했습니다.');
  }
};

export const deactivateAuthCode = async (authCode_id) => {
  const query = `UPDATE Auth_codes SET is_used = true WHERE id = ?`;
  const values = [authCode_id];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error('인증 코드 비활성화 중 오류가 발생했습니다.');
  }
};

export const updateUserPassword = async (user_id, newPassword) => {
  const query = `UPDATE User SET password = ? WHERE id = ?`;
  const values = [newPassword, user_id];

  try {
    await pool.query(query, values);
  } catch (error) {
    throw new Error('비밀번호 업데이트 중 오류가 발생했습니다.');
  }
};