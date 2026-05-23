const requiredEnvVars = {
  VITE_API_BASE_URL: 'API base URL',
  VITE_APP_NAME: 'Application name',
};

Object.entries(requiredEnvVars).forEach(([key, label]) => {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key} (${label})`);
  }
});

export const ENV = Object.freeze({
  MODE: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,

  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
});
