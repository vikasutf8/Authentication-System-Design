interface MongoUriConfig {
  user: string;
  password: string;
  cluster: string;
  hostSuffix: string;
}

export const buildMongoUri = ({
  user,
  password,
  cluster,
  hostSuffix,
}: MongoUriConfig): string => {
  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${cluster}.${hostSuffix}/?retryWrites=true&w=majority&appName=${cluster}`;
};
