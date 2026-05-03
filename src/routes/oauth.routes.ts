// src/routes/oauth.routes.ts

import { Router } from "express";

import tryCatch from "../middlewares/tryCatch";
import oauthController from "../controllers/oauth.controller";

const router = Router();

// Base: /auth
router.get("/:provider", tryCatch(oauthController.redirectToProvider));
router.get("/:provider/callback", tryCatch(oauthController.handleCallback));

export default router;