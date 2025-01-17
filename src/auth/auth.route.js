// src/auth/auth.route.js

import express from 'express';
import { signUpController } from './auth.controller.js';

export const authRouter = express.Router();

// 회원가입 API
authRouter.post('/signUp', signUpController);
