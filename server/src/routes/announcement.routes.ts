
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcement.controller.js';

const router = Router();

// Public: Get Active
router.get('/active', getActiveAnnouncements as unknown as RequestHandler);

// Admin Routes
router.use(authenticate as unknown as RequestHandler);
router.use(isAdmin as unknown as RequestHandler);

router.get('/', getAllAnnouncements as unknown as RequestHandler);
router.post('/', createAnnouncement as unknown as RequestHandler);
router.patch('/:id', updateAnnouncement as unknown as RequestHandler);
router.delete('/:id', deleteAnnouncement as unknown as RequestHandler);

export default router;
