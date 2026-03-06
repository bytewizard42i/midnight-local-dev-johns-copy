import path from 'node:path';
import { DockerComposeEnvironment, Wait, type StartedDockerComposeEnvironment } from 'testcontainers';
import { type Config } from './config.js';
import { currentDir } from './config.js';
import { type Logger } from 'pino';

export const createDockerEnv = (): DockerComposeEnvironment => {
  return new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'standalone.yml')
    .withWaitStrategy('midnight-proof-server', Wait.forLogMessage('Actix runtime found; starting in Actix runtime', 1))
    .withWaitStrategy('midnight-indexer', Wait.forLogMessage(/starting indexing/, 1));
};

export const startNetwork = async (config: Config, logger: Logger): Promise<StartedDockerComposeEnvironment> => {
  logger.info('Starting Midnight standalone network via docker compose...');
  const dockerEnv = createDockerEnv();
  const env = await dockerEnv.up();

  logger.info(`Node:         ${config.node}`);
  logger.info(`Indexer:      ${config.indexer}`);
  logger.info(`Indexer WS:   ${config.indexerWS}`);
  logger.info(`Proof Server: ${config.proofServer}`);
  logger.info('Midnight standalone network is running.');

  return env;
};

export const stopNetwork = async (env: StartedDockerComposeEnvironment, logger: Logger): Promise<void> => {
  logger.info('Stopping Midnight standalone network...');
  await env.down();
  logger.info('Network stopped.');
};
