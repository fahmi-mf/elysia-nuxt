import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env");
}

// In production, we use a pool (default 10). In dev or for migrations, we sometimes limit it.
// If you're in a Serverless environment (AWS Lambda/Vercel), keep max: 1 or use a Proxy.
// For VPS/Docker (standard with Elysia), remove the restriction.
const queryClient = postgres(process.env.DATABASE_URL);

export const db = drizzle(queryClient);