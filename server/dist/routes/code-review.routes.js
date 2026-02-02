import { Router } from 'express';
import { createCodeReview, getMyReviews, getReview, getReviewStats, } from '../controllers/code-review.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js'; // Ensure optionalAuth exists or handle manually
import { codeReviewLimiter } from '../middlewares/rateLimiter.js';
const router = Router();
// Public endpoint with rate limiting (Auth optional)
router.post('/', codeReviewLimiter, optionalAuthenticate, createCodeReview);
// Protected endpoints
router.get('/my-reviews', authenticate, getMyReviews);
router.get('/stats', authenticate, getReviewStats);
router.get('/:id', optionalAuthenticate, getReview); // Auth needed to check ownership
export default router;
