import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/auth.controller.js';
const router = Router();
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// GitHub OAuth
import passport from 'passport';
import { generateToken } from '../utils/jwt.js';
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication
    const user = req.user;
    const token = generateToken({
        userId: user.id,
        email: user.email,
    });
    // Redirect to frontend with token
    // Redirect to frontend with token
    const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication
    const user = req.user;
    const token = generateToken({
        userId: user.id,
        email: user.email,
    });
    // Redirect to frontend with token
    // Redirect to frontend with token
    const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
});
export default router;
