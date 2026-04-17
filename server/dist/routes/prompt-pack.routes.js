import { Router } from "express";
import { getPromptPackBySlug, getPromptPacks, togglePromptTemplateFavorite, trackPromptTemplateUsage, } from "../controllers/prompt-pack.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", optionalAuthenticate, getPromptPacks);
router.get("/:slug", optionalAuthenticate, getPromptPackBySlug);
router.post("/templates/:templateId/favorite", authenticate, togglePromptTemplateFavorite);
router.post("/templates/:templateId/usage", authenticate, trackPromptTemplateUsage);
export default router;
