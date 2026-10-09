import { Router, RequestHandler } from "express";
import {
  getPromptPackBySlug,
  getPromptPacks,
  togglePromptTemplateFavorite,
  trackPromptTemplateUsage,
} from "../controllers/prompt-pack.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate as RequestHandler, getPromptPacks as RequestHandler);
router.get("/:slug", optionalAuthenticate as RequestHandler, getPromptPackBySlug as RequestHandler);
router.post(
  "/templates/:templateId/favorite",
  authenticate as RequestHandler,
  togglePromptTemplateFavorite as RequestHandler
);
router.post(
  "/templates/:templateId/usage",
  authenticate as RequestHandler,
  trackPromptTemplateUsage as RequestHandler
);

export default router;
