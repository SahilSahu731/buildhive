import { Router, RequestHandler } from "express";
import {
  createRoadmap,
  exportRoadmap,
  generateRoadmapWeek,
  getRoadmapById,
  getRoadmapShareCard,
  getRoadmaps,
  replanRoadmap,
  setRoadmapTaskCompletion,
} from "../controllers/roadmap.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate as RequestHandler, getRoadmaps as RequestHandler);
router.post("/", authenticate as RequestHandler, createRoadmap as RequestHandler);
router.get("/:roadmapId", authenticate as RequestHandler, getRoadmapById as RequestHandler);
router.patch(
  "/:roadmapId/tasks/:taskId",
  authenticate as RequestHandler,
  setRoadmapTaskCompletion as RequestHandler
);
router.post("/:roadmapId/generate-week", authenticate as RequestHandler, generateRoadmapWeek as RequestHandler);
router.post("/:roadmapId/replan", authenticate as RequestHandler, replanRoadmap as RequestHandler);
router.get("/:roadmapId/export", authenticate as RequestHandler, exportRoadmap as RequestHandler);
router.get("/:roadmapId/share", authenticate as RequestHandler, getRoadmapShareCard as RequestHandler);

export default router;
