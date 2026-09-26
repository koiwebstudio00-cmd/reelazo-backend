import { z } from "zod";

const environmentSchema = z.object({
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().max(20).default(2),
  JOB_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  JOB_BACKOFF_MS: z.coerce.number().int().positive().default(2_000),
  FIXTURE_STEP_DELAY_MS: z.coerce.number().int().min(0).max(30_000).default(75),
});

export type AppConfig = z.infer<typeof environmentSchema>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  return environmentSchema.parse(environment);
}
