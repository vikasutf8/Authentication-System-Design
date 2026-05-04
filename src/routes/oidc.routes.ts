import axios from "axios";
import jwt from "jsonwebtoken";
import { ProviderKey } from "../constant/providers.constants";
import { OAUTH_PROVIDERS } from "../config/oauth";
import userModel from "../models/user.model";


export interface OAuthProfile {
  providerId: string;
  email:      string;
  name:       string;
  avatar?:    string;
  provider:   ProviderKey;
}

export function buildAuthUrl(provider: ProviderKey, state: string): string {
  const cfg = OAUTH_PROVIDERS[provider];
  const redirectUri = `${process.env.AUTH_SERVER_URL}/auth/${provider}/callback`;
  const params = new URLSearchParams({
    client_id:     cfg.clientId,
    redirect_uri:  redirectUri,
    scope:         cfg.scope,
    response_type: "code",
    state,
  });
  return `${cfg.authorizeUrl}?${params}`;
}

export async function exchangeCode(provider: ProviderKey, code: string) {
  const cfg = OAUTH_PROVIDERS[provider];
  const { data } = await axios.post(
    cfg.tokenUrl,
    {
      client_id:     cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      redirect_uri:  `${process.env.AUTH_SERVER_URL}/auth/${provider}/callback`,
      grant_type:    "authorization_code",
    },
    { headers: { Accept: "application/json" } }
  );
  return { accessToken: data.access_token, idToken: data.id_token };
}

export async function fetchProfile(
  provider: ProviderKey,
  accessToken: string,
  idToken?: string
): Promise<OAuthProfile> {
  const cfg = OAUTH_PROVIDERS[provider];

  if (cfg.type === "oidc" && idToken) {
    const d = jwt.decode(idToken) as any;
    return { providerId: d.sub, email: d.email, name: d.name, avatar: d.picture, provider };
  }

  const { data } = await axios.get(cfg.userUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let email = data.email;
  if (!email && provider === "github") {
    const { data: emails } = await axios.get(
      "https://api.github.com/user/emails",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    email = emails.find((e: any) => e.primary)?.email;
  }

  return {
    providerId: String(data.id ?? data.sub),
    email,
    name:   data.name ?? data.login,
    avatar: data.avatar_url ?? data.picture,
    provider,
  };
}

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

}