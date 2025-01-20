// src/auth/auth.route.js

import express from 'express';
import authenticateToken from '../../config/jwt.middleware.js';
import { 
    signUpController,
    loginController, 
    nicknameCheckController,
    emailCheckController,
    refreshController,
    deleteUserController,
    logoutController,
    sendEmailAuthController,
    verifyEmailAuthController
    } from './auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/signUp', signUpController);
authRouter.post('/email-auth/send', sendEmailAuthController);  
authRouter.post('/email-auth/verify', verifyEmailAuthController);  
authRouter.post('/login', loginController);
authRouter.post('/refresh', refreshController);  
authRouter.patch('/delete', authenticateToken, deleteUserController );   
authRouter.patch('/logout', authenticateToken, logoutController );
authRouter.post('/nickname-check', nicknameCheckController);
authRouter.post('/email-check', emailCheckController);
