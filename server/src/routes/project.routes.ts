
import { Router, RequestHandler } from 'express';
import multer from 'multer';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects
} from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (Optional: decide if guests can see projects. Let's allowing viewing)
router.get('/', getProjects as unknown as RequestHandler);
router.get('/my', authenticate as unknown as RequestHandler, getMyProjects as unknown as RequestHandler);
router.get('/:id', getProjectById as unknown as RequestHandler);
router.post('/', authenticate as unknown as RequestHandler, upload.array('imageFiles', 5), createProject as unknown as RequestHandler);
router.patch('/:id', authenticate as unknown as RequestHandler, upload.array('imageFiles', 5), updateProject as unknown as RequestHandler);
router.delete('/:id', authenticate as unknown as RequestHandler, deleteProject as unknown as RequestHandler);

export default router;
