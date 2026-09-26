import pino from "pino";

import { loadConfig } from "../config.js";
import type { GenerateReelJob } from "../domain/jobs.js";
import { createRedisConnection } from "../jobs/connection.js";
import { createReelQueue, enqueueReelGeneration } from "../jobs/queue.js";

const config = loadConfig();
const logger = pino({ name: "reelazo-producer" });
const connection = createRedisConnection(config.REDIS_URL);
const queue = createReelQueue(connection);

const data: GenerateReelJob = {
  organizationId: crypto.randomUUID(),
  reelId: crypto.randomUUID(),
  revisionId: crypto.randomUUID(),
  format: "real-estate-presenter",
  requestedAt: new Date().toISOString(),
  scenes: [
    {
      sceneId: crypto.randomUUID(),
      sourceAssetKey: "fixtures/property/front.jpg",
      label: "Frente de la propiedad",
      facts: { location: "Tucumán" },
    },
    {
      sceneId: crypto.randomUUID(),
      sourceAssetKey: "fixtures/property/living.jpg",
      label: "Living principal",
      facts: { feature: "Ambiente luminoso" },
    },
  ],
};

try {
  const job = await enqueueReelGeneration(queue, data, config);
  logger.info({ jobId: job.id, revisionId: data.revisionId }, "Job fixture encolado");
} finally {
  await queue.close();
  await connection.quit();
}
