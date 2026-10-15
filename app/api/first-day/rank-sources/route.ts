import { createSourceRankingHandler, rankSourcesWithGroq } from "../../../features/first-day/server/rank-sources";

export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createSourceRankingHandler({
  available: () => Boolean(process.env.GROQ_API_KEY?.trim()),
  rank: rankSourcesWithGroq,
  timeoutMs: 25_000,
});
