// src/config/oauth.config.ts

import { ProviderKey } from "../constant/providers.constants";

// export const OAUTH_PROVIDERS = {
//   github: {
//     clientId: process.env.GITHUB_CLIENT_ID!,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//     authorizeUrl: "https://github.com/login/oauth/authorize",
//     tokenUrl: "https://github.com/login/oauth/access_token",
//     userUrl: "https://api.github.com/user",
//     scope: "read:user user:email",
//     type: "oauth2" as const,
//   },
//   google: {
//     clientId: process.env.GOOGLE_CLIENT_ID!,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
//     tokenUrl: "https://oauth2.googleapis.com/token",
//     userUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
//     scope: "openid email profile",
//     type: "oidc" as const,
//   },
//   linkedin: {
//     clientId: process.env.LINKEDIN_CLIENT_ID!,
//     clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
//     authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
//     tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
//     userUrl: "https://api.linkedin.com/v2/userinfo",  // OIDC endpoint
//     scope: "openid profile email",
//     type: "oidc" as const,
//   },
// } as const;

// export type ProviderKey = keyof typeof OAUTH_PROVIDERS;




interface ProviderConfig {
  clientId:     string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl:     string;
  userUrl:      string;
  scope:        string;
  type:         "oauth2" | "oidc"; //by default we can set it as oauth2 but for google and linkedin we need to set it as oidc because they follow openid connect standard which is an extension of oauth2
}

export const OAUTH_PROVIDERS: Record<ProviderKey, ProviderConfig> = {
  github: {
    clientId:     process.env.GITHUB_CLIENT_ID!,
    clientSecret:process.env.GITHUB_CLIENT_SECRET!,
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl:     "https://github.com/login/oauth/access_token",
    userUrl:      "https://api.github.com/user",
    scope:        "read:user user:email",
    type:         "oauth2",
  },
  google: {
    clientId:     process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl:     "https://oauth2.googleapis.com/token",
    userUrl:      "https://www.googleapis.com/oauth2/v3/userinfo",
    scope:        "openid email profile",
    type:         "oidc",
  },
  linkedin: {
    clientId:     process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl:     "https://www.linkedin.com/oauth/v2/accessToken",
    userUrl:      "https://api.linkedin.com/v2/userinfo",
    scope:        "openid profile email",
    type:         "oidc",
  },
};