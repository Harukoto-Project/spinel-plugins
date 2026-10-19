import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);

// plugins/zen-automation/src/server/RunnerError.ts
var RunnerError = class extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "RunnerError";
  }
  status;
  code;
};

// plugins/zen-automation/src/server/parseRunRequest.ts
var TASKS = ["reports", "login"];
var invalid = (message) => {
  throw new RunnerError(400, "invalid_request", message);
};
var readFlag = (body, key) => {
  const value = body[key];
  if (value === void 0 || value === null) return false;
  if (typeof value !== "boolean") return invalid(`${key} \u306F true / false \u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044`);
  return value;
};
var readMonth = (body) => {
  const value = body["month"];
  if (value === void 0 || value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 12) {
    return invalid("month \u306F 1\u301C12 \u306E\u6574\u6570\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044");
  }
  return value;
};
var parseRunRequest = (input) => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return invalid("\u30EA\u30AF\u30A8\u30B9\u30C8\u30DC\u30C7\u30A3\u306F JSON \u30AA\u30D6\u30B8\u30A7\u30AF\u30C8\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044");
  }
  const body = input;
  const task = body["task"];
  if (typeof task !== "string" || !TASKS.includes(task)) {
    return invalid(`task \u306F ${TASKS.join(" / ")} \u306E\u3069\u3061\u3089\u304B\u3067\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044`);
  }
  if (task === "login") {
    return {
      task,
      headless: readFlag(body, "headless"),
      force: readFlag(body, "force"),
      manualGoogle: readFlag(body, "manualGoogle")
    };
  }
  return {
    task: "reports",
    dryRun: readFlag(body, "dryRun"),
    headless: readFlag(body, "headless"),
    month: readMonth(body)
  };
};
var buildScriptArgs = (request) => {
  const args = [];
  if (request.task === "login") {
    if (request.force) args.push("--force");
    if (request.headless) args.push("--headless");
    if (request.manualGoogle) args.push("--manual-google");
    return args;
  }
  if (request.dryRun) args.push("--dry-run");
  if (request.headless) args.push("--headless");
  if (request.month !== null && request.month !== void 0) args.push("--month", String(request.month));
  return args;
};

// plugins/zen-automation/src/server/runnerConfig.ts
import { stat } from "node:fs/promises";
import { join } from "node:path";
var TASK_SCRIPTS = {
  reports: "run_reports.py",
  login: "run_login.py"
};
var isFile = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};
var isDirectory = async (path) => {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
};
var readText = (value) => typeof value === "string" ? value.trim() : "";
var defaultPython = (projectPath) => process.platform === "win32" ? join(projectPath, ".venv", "Scripts", "python.exe") : join(projectPath, ".venv", "bin", "python");
var resolveRunnerConfig = async (ctx) => {
  const settings = await ctx.settings.get();
  const projectPath = readText(settings["projectPath"]);
  if (projectPath === "") {
    throw new RunnerError(400, "not_configured", "ZenStudy-Automation \u306E\u30D1\u30B9\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
  }
  if (!await isDirectory(projectPath)) {
    throw new RunnerError(400, "project_not_found", `ZenStudy-Automation \u306E\u30C7\u30A3\u30EC\u30AF\u30C8\u30EA\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ${projectPath}`);
  }
  const pythonPath = readText(settings["pythonPath"]) || defaultPython(projectPath);
  if (!await isFile(pythonPath)) {
    throw new RunnerError(400, "python_not_found", `Python \u306E\u5B9F\u884C\u30D5\u30A1\u30A4\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ${pythonPath}`);
  }
  return { projectPath, pythonPath };
};
var assertScriptExists = async (config, task) => {
  const script = TASK_SCRIPTS[task];
  if (!await isFile(join(config.projectPath, script))) {
    throw new RunnerError(400, "script_not_found", `${script} \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ${config.projectPath}`);
  }
  return script;
};
var describeConfigError = async (ctx) => {
  try {
    await resolveRunnerConfig(ctx);
    return null;
  } catch (error) {
    if (error instanceof RunnerError) return error.message;
    throw error;
  }
};

// plugins/zen-automation/src/server/ZenRunner.ts
var LOG_LIMIT = 300;
var STORAGE_KEY = "lastRun";
var ZenRunner = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  ctx;
  process = null;
  run = null;
  savedLogs = [];
  starting = false;
  stopRequested = false;
  async restore() {
    const saved = await this.ctx.storage.get(STORAGE_KEY);
    if (saved === null || typeof saved !== "object" || saved.run === void 0) return;
    this.run = saved.run;
    this.savedLogs = Array.isArray(saved.logs) ? saved.logs : [];
  }
  get running() {
    return this.starting || (this.process?.running ?? false);
  }
  async getStatus() {
    const configError = await describeConfigError(this.ctx);
    return {
      configured: configError === null,
      configError,
      running: this.running,
      run: this.run,
      logs: this.process ? this.process.logs(LOG_LIMIT) : this.savedLogs
    };
  }
  async start(request) {
    if (this.running) {
      throw new RunnerError(409, "already_running", "\u5225\u306E\u51E6\u7406\u304C\u5B9F\u884C\u4E2D\u3067\u3059\u3002\u7D42\u4E86\u3059\u308B\u304B\u505C\u6B62\u3057\u3066\u304B\u3089\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044");
    }
    this.starting = true;
    try {
      const config = await resolveRunnerConfig(this.ctx);
      const script = await assertScriptExists(config, request.task);
      const args = buildScriptArgs(request);
      let child;
      try {
        child = await this.ctx.process.spawn(config.pythonPath, [script, ...args], { cwd: config.projectPath });
      } catch (error) {
        this.ctx.logger.error("\u30D7\u30ED\u30BB\u30B9\u3092\u8D77\u52D5\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F", error);
        const reason = error instanceof Error ? error.message : String(error);
        throw new RunnerError(500, "spawn_failed", `\u30D7\u30ED\u30BB\u30B9\u3092\u8D77\u52D5\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F: ${reason}`);
      }
      const run = {
        task: request.task,
        args: [script, ...args],
        startedAt: child.startedAt,
        finishedAt: null,
        exitCode: null,
        signal: null,
        stopped: false
      };
      this.process = child;
      this.run = run;
      this.stopRequested = false;
      this.savedLogs = [];
      child.onExit((exit) => void this.handleExit(child, run, exit.code, exit.signal));
    } finally {
      this.starting = false;
    }
  }
  async stop() {
    const child = this.process;
    if (child === null || !child.running) {
      throw new RunnerError(409, "not_running", "\u5B9F\u884C\u4E2D\u306E\u51E6\u7406\u306F\u3042\u308A\u307E\u305B\u3093");
    }
    this.stopRequested = true;
    await child.stop();
  }
  async handleExit(child, run, exitCode, signal) {
    if (this.process !== child) return;
    const finished = {
      ...run,
      finishedAt: Date.now(),
      exitCode,
      signal,
      stopped: this.stopRequested
    };
    this.run = finished;
    const logs = child.logs(LOG_LIMIT);
    this.savedLogs = logs;
    try {
      await this.ctx.storage.set(STORAGE_KEY, { run: finished, logs });
    } catch (error) {
      this.ctx.logger.error("\u5B9F\u884C\u7D50\u679C\u3092\u4FDD\u5B58\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F", error);
    }
  }
};

// plugins/zen-automation/src/server/registerRoutes.ts
var sendRunnerError = (reply, error) => reply.code(error.status).send({ error: { code: error.code, message: error.message } });
var guard = async (reply, action) => {
  try {
    return await action();
  } catch (error) {
    if (error instanceof RunnerError) return sendRunnerError(reply, error);
    throw error;
  }
};
var registerRoutes = (ctx, runner) => {
  ctx.routes.get("/status", (_request, reply) => guard(reply, () => runner.getStatus()));
  ctx.routes.post(
    "/run",
    (request, reply) => guard(reply, async () => {
      await runner.start(parseRunRequest(request.body));
      return runner.getStatus();
    })
  );
  ctx.routes.post(
    "/stop",
    (_request, reply) => guard(reply, async () => {
      await runner.stop();
      return runner.getStatus();
    })
  );
};

// plugins/zen-automation/src/server/index.ts
async function activate(ctx) {
  const runner = new ZenRunner(ctx);
  await runner.restore();
  registerRoutes(ctx, runner);
}
export {
  activate as default
};
