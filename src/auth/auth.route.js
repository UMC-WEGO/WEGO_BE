// src/auth/auth.route.js

import express from 'express';
import authenticateToken from '../../config/jwt.middleware.js';
import { 
    signUpController,
    loginController, 
    nicknameCheckController,
    emailCheckController,
    refreshController,
    deleteUserController 
    } from './auth.controller.js';


export const authRouter = express.Router();

// 회원가입 API
authRouter.post('/signUp', signUpController);
authRouter.post('/email-auth/send', );  
authRouter.post('/email-auth/verify', );  
authRouter.post('/login', loginController);
authRouter.post('/refresh', refreshController);  
authRouter.patch('/delete', authenticateToken, deleteUserController );   
authRouter.patch('/logout', authenticateToken );
authRouter.post('/nickname-check', nicknameCheckController);
authRouter.post('/email-check', emailCheckController);
