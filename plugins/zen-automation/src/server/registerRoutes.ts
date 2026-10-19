import type { FastifyReply } from 'fastify';
import type { PluginContext } from '@spinel/server';
import { RunnerError } from './RunnerError.js';
import { parseRunRequest } from './parseRunRequest.js';
import type { ZenRunner } from './ZenRunner.js';

const sendRunnerError = (reply: FastifyReply, error: RunnerError): FastifyReply =>
  reply.code(error.status).send({ error: { code: error.code, message: error.message } });

const guard = async (reply: FastifyReply, action: () => Promise<unknown>): Promise<unknown> => {
  try {
    return await action();
  } catch (error) {
    if (error instanceof RunnerError) return sendRunnerError(reply, error);
    throw error;
  }
};

export const registerRoutes = (ctx: PluginContext, runner: ZenRunner): void => {
  ctx.routes.get('/status', (_request, reply) => guard(reply, () => runner.getStatus()));

  ctx.routes.post('/run', (request, reply) =>
    guard(reply, async () => {
      await runner.start(parseRunRequest(request.body));
      return runner.getStatus();
    }),
  );

  ctx.routes.post('/stop', (_request, reply) =>
    guard(reply, async () => {
      await runner.stop();
      return runner.getStatus();
    }),
  );
};
