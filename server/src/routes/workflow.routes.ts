import { Router, RequestHandler } from "express";
import {
  getWorkflowBySlug,
  getWorkflowResumeStep,
  getWorkflows,
  removeWorkflowBookmark,
  saveWorkflowBookmark,
  setWorkflowStepCompletion,
} from "../controllers/workflow.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate as RequestHandler, getWorkflows as RequestHandler);
router.get("/id/:workflowId/resume", authenticate as RequestHandler, getWorkflowResumeStep as RequestHandler);
router.patch(
  "/id/:workflowId/steps/:stepId",
  authenticate as RequestHandler,
  setWorkflowStepCompletion as RequestHandler
);
router.post("/id/:workflowId/bookmark", authenticate as RequestHandler, saveWorkflowBookmark as RequestHandler);
router.delete("/id/:workflowId/bookmark", authenticate as RequestHandler, removeWorkflowBookmark as RequestHandler);
router.get("/:slug", optionalAuthenticate as RequestHandler, getWorkflowBySlug as RequestHandler);

export default router;
