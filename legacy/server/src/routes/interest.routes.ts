
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { 
    expressInterest, 
    getInterestStatus, 
    getProjectInterests, 
    updateInterestStatus, 
    getMyInterests 
} from '../controllers/interest.controller.js';

const router = Router();

// Public/Protected mixed routes
router.get('/status/:projectId', authenticate as RequestHandler, getInterestStatus as RequestHandler);

// Protected Routes
router.post('/:projectId', authenticate as RequestHandler, expressInterest as RequestHandler);
router.get('/project/:projectId', authenticate as RequestHandler, getProjectInterests as RequestHandler); // Owner view
router.patch('/:interestId/status', authenticate as RequestHandler, updateInterestStatus as RequestHandler); // Owner action
router.get('/me', authenticate as RequestHandler, getMyInterests as RequestHandler); // User Dashboard

export default router;
