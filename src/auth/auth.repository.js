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
