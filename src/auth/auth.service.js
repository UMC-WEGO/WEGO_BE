// src/auth/auth.service.js

import { createUser } from './auth.repository.js';
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
