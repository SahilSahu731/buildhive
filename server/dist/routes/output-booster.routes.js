import { Router } from "express";
import { analyzeOutput, compareOutputBoosterRuns, getOutputBoosterHistory, } from "../controllers/output-booster.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/analyze", authenticate, analyzeOutput);
router.get("/history", authenticate, getOutputBoosterHistory);
router.get("/compare", authenticate, compareOutputBoosterRuns);
export default router;
