const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

export const isBackendConfigured = import.meta.env.DEV || Boolean(configuredApiBase);

export function apiUrl(path) {
  return `${configuredApiBase}${path.startsWith('/') ? path : `/${path}`}`;
}
