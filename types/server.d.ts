import type { FastifyReply, FastifyRequest } from 'fastify';

export type NotificationPriority = 'normal' | 'urgent';

export type PluginSettingValue = string | number | boolean | null;

export type PluginSettings = Record<string, PluginSettingValue>;

export interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

export type PluginRouteHandler = (request: FastifyRequest, reply: FastifyReply) => unknown;

export interface PluginRoutes {
  get(path: string, handler: PluginRouteHandler): void;
  post(path: string, handler: PluginRouteHandler): void;
  put(path: string, handler: PluginRouteHandler): void;
  delete(path: string, handler: PluginRouteHandler): void;
}

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export interface PluginNotification {
  title: string;
  body: string;
  priority?: NotificationPriority;
}

export interface PluginNotify {
  publish(notification: PluginNotification): number;
}

export interface PluginHttp {
  fetch(input: string | URL, init?: RequestInit): Promise<Response>;
}

export interface PluginSettingsApi {
  get(): Promise<PluginSettings>;
}

export interface ProcessExit {
  code: number | null;
  signal: string | null;
}

export interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
}

export interface ManagedProcess {
  readonly id: string;
  readonly pid: number | undefined;
  readonly command: string;
  readonly args: readonly string[];
  readonly startedAt: number;
  readonly running: boolean;
  readonly exit: ProcessExit | null;
  logs(limit?: number): string[];
  onLog(listener: (line: string) => void): () => void;
  onExit(listener: (exit: ProcessExit) => void): () => void;
  stop(): Promise<void>;
}

export interface PluginProcessApi {
  spawn(command: string, args?: readonly string[], options?: SpawnOptions): Promise<ManagedProcess>;
  list(): ManagedProcess[];
}

export interface PluginContext {
  readonly id: string;
  readonly version: string;
  readonly logger: PluginLogger;
  readonly settings: PluginSettingsApi;
  readonly storage: PluginStorage;
  readonly routes: PluginRoutes;
  readonly notify: PluginNotify;
  readonly http: PluginHttp;
  readonly process: PluginProcessApi;
  onDeactivate(listener: () => void | Promise<void>): void;
}

export interface PluginInstance {
  deactivate?(): void | Promise<void>;
}

export type PluginActivate = (context: PluginContext) => void | PluginInstance | Promise<void | PluginInstance>;
