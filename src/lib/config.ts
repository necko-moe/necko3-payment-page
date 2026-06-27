declare global {
  interface Window {
    __NECKO_CONFIG__?: { apiUrl: string; apiKey: string };
  }
}

export function getApiUrl(): string {
  return (
    window.__NECKO_CONFIG__?.apiUrl ?? import.meta.env.VITE_API_URL ?? ""
  );
}

export function getApiKey(): string {
  return window.__NECKO_CONFIG__?.apiKey ?? import.meta.env.PUBLIC_API_KEY ?? "";
}
