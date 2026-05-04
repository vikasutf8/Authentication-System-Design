export const PROVIDER = {
  GITHUB:   "github",
  GOOGLE:   "google",
  LINKEDIN: "linkedin",
} as const;

export type ProviderKey = typeof PROVIDER[keyof typeof PROVIDER];