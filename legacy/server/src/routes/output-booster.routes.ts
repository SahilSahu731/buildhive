import { Router, RequestHandler } from "express";
import {
  analyzeOutput,
  compareOutputBoosterRuns,
  getOutputBoosterHistory,
} from "../controllers/output-booster.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/analyze", authenticate as RequestHandler, analyzeOutput as RequestHandler);
router.get("/history", authenticate as RequestHandler, getOutputBoosterHistory as RequestHandler);
router.get("/compare", authenticate as RequestHandler, compareOutputBoosterRuns as RequestHandler);

export default router;
