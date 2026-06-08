const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = domain
  ? `https://${domain}/api`
  : "https://67dff9f5-b28a-46a1-aa35-75fb7d20b29d-00-24zrpi3ramao7.sisko.replit.dev/api";
