import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { getAdminStats, getAllUsers, updateUser, deleteUser, getAllProjects, deleteProject } from '../controllers/admin.controller.js';
const router = Router();
// Apply auth and admin middleware to all routes
router.use(authenticate);
router.use(isAdmin);
// Dashboard
router.get('/stats', getAdminStats);
// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
// Project Management
router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProject);
export default router;
