const domain = process.env.EXPO_PUBLIC_DOMAIN;
export const API_BASE = domain
  ? `https://${domain}/api`
  : "https://workspace.hatemanishyadav-maker.repl.co/api";
