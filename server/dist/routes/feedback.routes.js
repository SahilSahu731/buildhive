import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { submitFeedback, getAllFeedbacks, updateFeedbackStatus, deleteFeedback } from '../controllers/feedback.controller.js';
const router = Router();
// Public/User: Submit Feedback
// Use optionalAuthenticate so we can attach userId if logged in, but allow anonymous if needed?
// Actually requirements say "user can suggest", usually implies logged in users for a platform like this.
// But to be safe let's assume logged in mostly.
// Let's use `optionalAuthenticate` to support both if we want, or just `authenticate`.
// Given it's a "dev platform", probably logged in. Let's use `authenticate` for now to prevent spam.
router.post('/', authenticate, submitFeedback);
// Admin Routes
router.get('/', authenticate, isAdmin, getAllFeedbacks);
router.patch('/:id/status', authenticate, isAdmin, updateFeedbackStatus);
router.delete('/:id', authenticate, isAdmin, deleteFeedback);
export default router;
