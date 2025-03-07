import dotenv from "dotenv";
import logger from "../common/logger.js";
import { createClient } from "redis";
dotenv.config();

const isRedisEnabled = () => {
  const redisEnabled = process.env.REDIS_ENABLED === "true";
  logger.info(`------ Redis Enabled ----- ${redisEnabled}`);
  return redisEnabled;
};

let rClient;
let redisOptions = {
  url:
    process.env.REDIS_URL ??
    `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
};

if (process.env.REDIS_USERNAME && process.env.REDIS_PASSWORD) {
  redisOptions = {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  };
}

if (isRedisEnabled()) {
  rClient = createClient(redisOptions);
  rClient.on("connect", () => logger.info(`------ CONNECTING -----`));
  rClient.on("ready", () =>
    logger.info(`------ Client connected with REDIS -----`),
  );
  rClient.on("error", (err) => {
    throw new Error(`ERROR connecting to REDIS  ${err}`);
  });
}

const initializeRedisConnection = async (redisClient) => {
  if (!isRedisEnabled()) {
    return;
  }
  logger.info(`------ REDIS_HOST -----${process.env.REDIS_HOST}`);
  logger.info(`------ REDIS_PORT -----${process.env.REDIS_PORT}`);
  logger.info(`------ REDIS_URL -----${process.env.REDIS_URL}`);
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`------ Redis Cache connection error ----- ${err}`);
  }
};

const closeRedisConnection = async (redisClient) => {
  logger.info(`------ DISCONNECTED -----`);
  try {
    await redisClient.disconnect();
  } catch (err) {
    logger.error(`------ Redis Connection closing error ----- ${err}`);
  }
};

export {
  initializeRedisConnection,
  closeRedisConnection,
  isRedisEnabled,
  rClient,
};
