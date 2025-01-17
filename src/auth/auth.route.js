// src/auth/auth.route.js

import express from 'express';
import { signUpController } from './auth.controller.js';

export const authRouter = express.Router();

// 회원가입 API
authRouter.post('/signUp', signUpController);
authRouter.post('/email-auth/send', );  
authRouter.post('/email-auth/verify', );  
authRouter.post('/login', );
authRouter.post('/refresh', );  
authRouter.post('/delete', );   
authRouter.post('/logout', );
authRouter.post('/nickname-check', );
authRouter.post('/email-check', );
