import type { HomeSection } from "./products";

/**
 * Max number of products the admin can curate per Home page section. Single
 * source of truth for the cap: change these two numbers if the client asks
 * for a different count, and both the server-side enforcement
 * (app/admin/(protected)/home/actions.ts) and the admin UI's displayed
 * limit stay in sync automatically. No fetch/env code in this file so it's
 * safe to import from client components too.
 */
export const HOME_SECTION_LIMITS: Record<HomeSection, number> = {
  new_products: 12,
  featured_models: 6,
};
