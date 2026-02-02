import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { expressInterest, getInterestStatus, getProjectInterests, updateInterestStatus, getMyInterests } from '../controllers/interest.controller.js';
const router = Router();
// Public/Protected mixed routes
router.get('/status/:projectId', authenticate, getInterestStatus);
// Protected Routes
router.post('/:projectId', authenticate, expressInterest);
router.get('/project/:projectId', authenticate, getProjectInterests); // Owner view
router.patch('/:interestId/status', authenticate, updateInterestStatus); // Owner action
router.get('/me', authenticate, getMyInterests); // User Dashboard
export default router;
