export function loadWorkspaceEnv() {
  // Next.js loads `.env.local` from the app root. In this workspace that file is
  // a symlink to `../.env.local`, so server code should only read process.env.
}

export function getEnv(name: string) {
  loadWorkspaceEnv();
  return process.env[name];
}

export function requireEnv(name: string) {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
