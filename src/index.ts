import pino from "pino";

import { loadConfig } from "./config.js";
import { createRedisConnection } from "./jobs/connection.js";
import { createFixtureProviders } from "./providers/fixture.js";
import { startReelWorker } from "./worker.js";
import { noOpWorkflowStore } from "./workflow/store.js";

const config = loadConfig();
const logger = pino({ name: "reelazo-worker" });
const connection = createRedisConnection(config.REDIS_URL);
const worker = startReelWorker({
  connection,
  config,
  logger,
  providers: createFixtureProviders(config.FIXTURE_STEP_DELAY_MS),
  store: noOpWorkflowStore,
});

connection.on("connect", () => {
  logger.info(
    { queue: worker.name, concurrency: config.WORKER_CONCURRENCY },
    "Worker conectado a Redis",
  );
});
connection.on("error", (error: Error) => {
  logger.error({ error }, "No se pudo conectar a Redis");
});

let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Cerrando worker");
  await worker.close();
  await connection.quit();
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
