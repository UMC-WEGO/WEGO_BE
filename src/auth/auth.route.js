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
    verifyEmailAuthController,
    sendPasswordAuthController,
    verifyPasswordAuthController,
    passwordChangeController
    } from './auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/signUp', signUpController);
authRouter.post('/email-auth/send', sendEmailAuthController);  
authRouter.post('/email-auth/verify', verifyEmailAuthController);
authRouter.post('/password-auth/send', sendPasswordAuthController);  
authRouter.post('/password-auth/verify', verifyPasswordAuthController);  
authRouter.patch('/password', passwordChangeController);  
authRouter.post('/login', loginController);
authRouter.post('/refresh', refreshController);  
authRouter.patch('/delete', authenticateToken, deleteUserController );   
authRouter.patch('/logout', authenticateToken, logoutController );
authRouter.post('/nickname-check', nicknameCheckController);
authRouter.post('/email-check', emailCheckController);
