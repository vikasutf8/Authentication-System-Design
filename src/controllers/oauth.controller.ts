// src/controllers/oauth.controller.ts

import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  buildAuthUrl,
  exchangeCode,
  fetchProfile,
  upsertOAuthUser,
} from "../services/oauth.service";
import {  OAUTH_PROVIDERS } from "../config/oauth";
import { ProviderKey } from "../constant/providers.constants";

const oauthStateStore = new Map<string, number>(); // state → expiry timestamp
const OAUTH_STATE_EXPIRY = parseInt(process.env.OAUTH_STATE_EXPIRY!); // 1 hour
class OAuthController {

  // GET /auth/:provider
  // Redirects user to GitHub/Google/LinkedIn
  redirectToProvider = (req: Request, res: Response) => {
    const provider = req.params.provider as ProviderKey;

    if (!OAUTH_PROVIDERS[provider]) {
      return res.status(400).json({ message: "Unsupported provider" });
    }

    const state = crypto.randomBytes(16).toString("hex");
    oauthStateStore.set(state, Date.now() + OAUTH_STATE_EXPIRY);
// ["hkjlfasdhfakjsdhfas", 1697055600000]
    const url = buildAuthUrl(provider, state);
      
// /https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client-id
    res.redirect(url); // authentizatiuon server
  };

  // GET /auth/:provider/callback
  // GitHub/Google redirects here with ?code=...&state=...
  handleCallback = async (req: Request, res: Response) => {
    const provider = req.params.provider as ProviderKey;//google 
    const { code, state } = req.query as { code: string; state: string };
    //what is code here ...

    // Validate state (CSRF protection)
    const expiry = oauthStateStore.get(state);
    if (!expiry || Date.now() > expiry) {
      return res.status(400).json({ message: "Invalid or expired state" });
    }
    oauthStateStore.delete(state);

    // Exchange code for tokens
    const { accessToken, idToken } = await exchangeCode(provider, code);

    // Get user profile
    const profile = await fetchProfile(provider, accessToken, idToken);

    // Upsert in DB
    const user = await upsertOAuthUser(profile);

    // Issue your own JWT (same as your existing login flow)
    const token = jwt.sign(
      {  email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  };
}

export default new OAuthController();