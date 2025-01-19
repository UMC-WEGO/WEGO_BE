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
    console.error('Error during user creation:', error.message);
    console.error(error.stack);
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
};

export const findUserByEmail = async (email) => {
  const query = `SELECT * FROM User WHERE email = ?`;
  const values = [email];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by email:', error.message);
    console.error(error.stack);
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
    console.error('Error updating refresh token:', error.message);
    console.error(error.stack);
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
    console.error('Error fetching user by nickname:', error.message);
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
    console.error('Error fetching user by refresh token:', error.message);
    throw new Error('리프레시 토큰 조회 중 오류가 발생했습니다.');
  }
};

export const findUserById = async (userId) => {
  const query = `SELECT * FROM User WHERE id = ?`;
  const values = [userId];

  try {
    const [rows] = await pool.query(query, values);
    return rows[0]; 
  } catch (error) {
    console.error('Error fetching user by id:', error.message);
    throw new Error('사용자 조회 중 오류가 발생했습니다.');
  }
};


export const deactivateUserById = async (userId) => {
  const query = `
    UPDATE User 
    SET status = 'INACTIVE', nickname = '탈퇴한 사용자', refreshToken = NULL 
    WHERE id = ?;
  `;
  const values = [userId];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error deactivating user:', error.message);
    throw new Error('회원 탈퇴 중 오류가 발생했습니다.');
  }
};