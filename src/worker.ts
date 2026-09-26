import { Worker, type Job } from "bullmq";
import type { Redis } from "ioredis";
import type { Logger } from "pino";

import type { AppConfig } from "./config.js";
import {
  generateReelJobSchema,
  type GenerateReelJob,
  type ReelJobResult,
} from "./domain/jobs.js";
import { GENERATE_REEL_JOB, REEL_GENERATION_QUEUE } from "./jobs/constants.js";
import type { PipelineProviders } from "./providers/contracts.js";
import { runGenerationPipeline } from "./workflow/pipeline.js";
import type { WorkflowStore } from "./workflow/store.js";

type WorkerDependencies = {
  connection: Redis;
  config: AppConfig;
  logger: Logger;
  providers: PipelineProviders;
  store: WorkflowStore;
};

export function startReelWorker(dependencies: WorkerDependencies) {
  const worker = new Worker<GenerateReelJob, ReelJobResult>(
    REEL_GENERATION_QUEUE,
    async (job: Job<GenerateReelJob, ReelJobResult>) => {
      if (job.name !== GENERATE_REEL_JOB) {
        throw new Error(`Tipo de job no soportado: ${job.name}`);
      }

      const data = generateReelJobSchema.parse(job.data);
      await dependencies.store.markStarted(data.revisionId, job.attemptsMade + 1);

      try {
        const result = await runGenerationPipeline(data, {
          providers: dependencies.providers,
          onProgress: async (progress) => {
            await job.updateProgress(progress);
            await dependencies.store.saveProgress(data.revisionId, progress);
          },
        });
        await dependencies.store.markCompleted(data.revisionId, result);
        return result;
      } catch (cause) {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        await dependencies.store.markFailed(data.revisionId, error);
        throw error;
      }
    },
    {
      connection: dependencies.connection,
      concurrency: dependencies.config.WORKER_CONCURRENCY,
    },
  );

  worker.on("completed", (job) => {
    dependencies.logger.info({ jobId: job.id }, "Job de reel completado");
  });
  worker.on("failed", (job, error) => {
    dependencies.logger.error(
      { jobId: job?.id, attempt: job?.attemptsMade, error },
      "Job de reel falló",
    );
  });
  worker.on("error", (error) => {
    dependencies.logger.error({ error }, "Error del worker");
  });

  return worker;
}
