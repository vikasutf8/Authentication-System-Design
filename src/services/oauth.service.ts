// src/services/oauth.service.ts

// import axios from "axios";
import jwt from "jsonwebtoken";
import { OAUTH_PROVIDERS, } from "../config/oauth";
import { ProviderKey } from "../constant/providers.constants";
// import { db } from "../config/db"; // your DB client
import axios from "axios";
import UserModel, { IUser } from "../models/user.model";
import userModel from "../models/user.model";
import { email } from "zod";

interface OAuthProfile {
  providerId: string;
  email: string;
  name: string;
//   avatar?: string;
  provider: ProviderKey;
}

// Step A: Build redirect URL
export function buildAuthUrl(provider: ProviderKey, state: string): string {
  //google,"hkjlfasdhfakjsdhfas"
  const config = OAUTH_PROVIDERS[provider];
  const redirectUri = `${process.env.BASE_URL}/auth/${provider}/callback`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scope,
    response_type: "code",
    state,

  });

  /**
   * what paraams
   * client id:  process.env.GOOGLE_CLIENT_ID!
   * redirect_uri: http://localhost:3000/auth/google/callback
   * scope: "openid email profile",
   * response_type: "code",
   * state : "hkjlfasdhfakjsdhfas"`
   */
  console.log(config,"---", redirectUri, "---", params.toString());
  
// /https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fgoogle%2Fcallback&scope=openid+email+profile&response_type=code&state=hkjlfasdhfakjsdhfas
  return `${config.authorizeUrl}?${params.toString()}`;
}

// Step B: Exchange code → access_token (+ id_token for OIDC)
export async function exchangeCode(
  provider: ProviderKey,
  code: string
): Promise<{ accessToken: string; idToken?: string }> {
  const config = OAUTH_PROVIDERS[provider];
  const redirectUri = `${process.env.BASE_URL}/auth/${provider}/callback`;

  const { data } = await axios.post(
    config.tokenUrl,
    {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    },
    { headers: { Accept: "application/json" } }
  );

  return {
    accessToken: data.access_token,
    idToken: data.id_token, // present for OIDC providers
  };
}

// Step C: Get user profile
export async function fetchProfile(
  provider: ProviderKey,
  accessToken: string,
  idToken?: string
): Promise<OAuthProfile> {
  const config = OAUTH_PROVIDERS[provider];

  // OIDC: decode id_token directly (already has user info)
  if (config.type === "oidc" && idToken) {
    const decoded = jwt.decode(idToken) as any;
    return {
      providerId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      // avatar: decoded.picture,
      provider,
    };
  }

  // OAuth2 (GitHub): hit /user endpoint
  const { data } = await axios.get(config.userUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // GitHub emails can be private — fetch separately if needed
  let email = data.email;
  if (!email && provider === "github") {
    const { data: emails } = await axios.get(
      "https://api.github.com/user/emails",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    email = emails.find((e: any) => e.primary)?.email;
  }

  return {
    providerId: String(data.id || data.sub),
    email,
    name: data.name || data.login,
    // avatar: data.avatar_url || data.picture,
    provider,
  };
}

// Step D: Upsert user in your DB
export async function upsertOAuthUser(profile: OAuthProfile) {
  // Check if user already linked this provider
  let user = await userModel.findOne({
    where: { oauthProvider: profile.provider, oauthId: profile.providerId },
  });

  console.log(user,"---user---oauthservice");

  if (!user) {
    // Check if email already exists (user registered normally before)
    user = await userModel.findOne({ where: { email: profile.email } });

    if (user) {
      // Link provider to existing account
      await userModel.findOneAndUpdate({
        where: { email: profile.email },
        data: { oauthProvider: profile.provider, oauthId: profile.providerId ,sessionVersion: user.sessionVersion + 1}, // increment sessionVersion to invalidate existing sessions
      });
    } else {
      // New user — create
      user = await userModel.create({
        name: profile.name,
        email: profile.email,
        oauthProvider: profile.provider,
        oauthId: profile.providerId,
        isVerified: true, // consider OAuth emails as verified
        sessionVersion: 1,
      });
    }
  }

  return user;
}