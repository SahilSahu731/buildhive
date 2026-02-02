import { Router } from 'express';
import multer from 'multer';
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getMyProjects } from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Public routes (Optional: decide if guests can see projects. Let's allowing viewing)
router.get('/', getProjects);
router.get('/my', authenticate, getMyProjects);
router.get('/:id', getProjectById);
router.post('/', authenticate, upload.array('imageFiles', 5), createProject);
router.patch('/:id', authenticate, upload.array('imageFiles', 5), updateProject);
router.delete('/:id', authenticate, deleteProject);
export default router;
