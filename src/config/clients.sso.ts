export interface OAuthClient {
  clientId:     string;
  clientSecret: string;
  redirectUris: string[];
  name:         string;
}

// SSO
export const REGISTERED_CLIENTS: Record<string, OAuthClient> = {
  "app-a-client-id": {
    clientId:     "app-a-client-id",
    clientSecret: "app-a-secret",
    redirectUris: ["http://localhost:4000/auth/callback"],
    name:         "App A",
  },
  "app-b-client-id": {
    clientId:     "app-b-client-id",
    clientSecret: "app-b-secret",
    redirectUris: ["http://localhost:5000/auth/callback"],
    name:         "App B",
  },
};