
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import {
    getAdminStats,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllProjects,
    deleteProject
} from '../controllers/admin.controller.js';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authenticate as unknown as RequestHandler);
router.use(isAdmin as unknown as RequestHandler);

// Dashboard
router.get('/stats', getAdminStats as unknown as RequestHandler);

// User Management
router.get('/users', getAllUsers as unknown as RequestHandler);
router.patch('/users/:id', updateUser as unknown as RequestHandler);
router.delete('/users/:id', deleteUser as unknown as RequestHandler);

// Project Management
router.get('/projects', getAllProjects as unknown as RequestHandler);
router.delete('/projects/:id', deleteProject as unknown as RequestHandler);

export default router;
