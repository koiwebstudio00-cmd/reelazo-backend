import { Queue } from "bullmq";
import { Redis } from "ioredis";
import pino from "pino";

const logger = pino({ name: "reelazo-worker" });
const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const queue = new Queue("reel-generation", { connection });

connection.on("connect", () => {
  logger.info({ queue: queue.name }, "Worker conectado a Redis");
});

connection.on("error", (error: Error) => {
  logger.error({ error }, "No se pudo conectar a Redis");
});

const shutdown = async () => {
  logger.info("Cerrando worker");
  await queue.close();
  await connection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
