import { api } from "./auth.api";

// Backend route: GET /analytics/dashboard?range=7d|30d|all
// Requires: Bearer auth token
export const getAnalyticsDashboard = (range = "7d") =>
  api.get("/analytics/dashboard", { params: { range } });

// GET /analytics/suggestions/summary?range=7d|30d|all
export const getSuggestionsSummary = (range = "30d") =>
  api.get("/analytics/suggestions/summary", { params: { range } });

// GET /analytics/menu/trending?range=7d|30d|all
export const getMenuTrending = (range = "7d") =>
  api.get("/analytics/menu/trending", { params: { range } });
