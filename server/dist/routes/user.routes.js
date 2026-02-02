import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getMyProfile, getUserProfile, updateProfile } from '../controllers/user.controller.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.get('/me', authenticate, getMyProfile);
router.get('/:username', getUserProfile); // Public
router.patch('/me', authenticate, upload.single('imageFile'), updateProfile);
export default router;
