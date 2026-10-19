import type { PluginContext } from '@spinel/server';
import { ZenRunner } from './ZenRunner.js';
import { registerRoutes } from './registerRoutes.js';

export default async function activate(ctx: PluginContext): Promise<void> {
  const runner = new ZenRunner(ctx);
  await runner.restore();
  registerRoutes(ctx, runner);
}
