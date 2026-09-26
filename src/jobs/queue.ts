import { Queue } from "bullmq";
import type { Redis } from "ioredis";

import type { AppConfig } from "../config.js";
import {
  generateReelJobSchema,
  type GenerateReelJob,
  type ReelJobResult,
} from "../domain/jobs.js";
import { GENERATE_REEL_JOB, REEL_GENERATION_QUEUE } from "./constants.js";

export function createReelQueue(connection: Redis): Queue<GenerateReelJob, ReelJobResult> {
  return new Queue<GenerateReelJob, ReelJobResult>(REEL_GENERATION_QUEUE, { connection });
}

export function buildReelJobId(data: GenerateReelJob): string {
  return `${data.organizationId}-${data.revisionId}`;
}

export async function enqueueReelGeneration(
  queue: Queue<GenerateReelJob, ReelJobResult>,
  input: GenerateReelJob,
  config: Pick<AppConfig, "JOB_ATTEMPTS" | "JOB_BACKOFF_MS">,
) {
  const data = generateReelJobSchema.parse(input);

  return queue.add(GENERATE_REEL_JOB, data, {
    jobId: buildReelJobId(data),
    attempts: config.JOB_ATTEMPTS,
    backoff: { type: "exponential", delay: config.JOB_BACKOFF_MS },
    removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5_000 },
    removeOnFail: { age: 30 * 24 * 60 * 60, count: 10_000 },
  });
}
