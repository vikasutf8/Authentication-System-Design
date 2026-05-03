// src/routes/oauth.routes.ts

import { Router } from "express";

import tryCatch from "../middlewares/tryCatch";

const router = Router();

// Base: /auth
// router.get("/:provider", tryCatch(OAuthController.redirectToProvider));
// router.get("/:provider/callback", tryCatch(OAuthController.handleCallback));

export default router;