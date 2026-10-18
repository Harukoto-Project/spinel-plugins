import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const HOST_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  'lucide-react',
  '@/lib/utils',
  '@/components/ui/*',
];

const GUARDED_PACKAGES = /^(react|react-dom|lucide-react)(\/|$)/;
const FRONT_ENTRY_CANDIDATES = ['src/front/index.tsx', 'src/front/index.ts'];
const SERVER_ENTRY_CANDIDATES = ['src/server/index.ts'];

const hostModuleGuard = {
  name: 'host-module-guard',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: GUARDED_PACKAGES }, (args) => {
      if (HOST_EXTERNALS.includes(args.path)) return null;
      return {
        errors: [
          {
            text: `"${args.path}" はホストと共有されていません。共有されているのは ${HOST_EXTERNALS.join(', ')} のみです`,
          },
        ],
      };
    });
  },
};

function findEntry(pluginDir, candidates) {
  const found = candidates.find((candidate) => existsSync(path.join(pluginDir, candidate)));
  return found ? path.join(pluginDir, found) : null;
}

function readPluginDirs(filter) {
  const index = JSON.parse(readFileSync(path.join(ROOT, 'repository.json'), 'utf8'));
  const plugins = index.plugins.filter((plugin) => !filter || plugin.id === filter);
  if (filter && plugins.length === 0) {
    throw new Error(`repository.json に id="${filter}" のプラグインがありません`);
  }
  return plugins.map((plugin) => ({ id: plugin.id, dir: path.join(ROOT, plugin.path) }));
}

async function buildFront(pluginDir, entry) {
  const outfile = path.join(pluginDir, 'front', 'index.js');
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    external: HOST_EXTERNALS,
    plugins: [hostModuleGuard],
    legalComments: 'none',
    logLevel: 'warning',
  });
  return outfile;
}

async function buildServer(pluginDir, entry) {
  const outfile = path.join(pluginDir, 'server', 'index.mjs');
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    banner: { js: "import { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);" },
    legalComments: 'none',
    logLevel: 'warning',
  });
  return outfile;
}

async function buildPlugin({ id, dir }) {
  if (!existsSync(path.join(dir, 'plugin.toml'))) {
    throw new Error(`${id}: ${path.relative(ROOT, dir)} に plugin.toml がありません`);
  }

  const frontEntry = findEntry(dir, FRONT_ENTRY_CANDIDATES);
  const serverEntry = findEntry(dir, SERVER_ENTRY_CANDIDATES);
  if (!frontEntry && !serverEntry) {
    throw new Error(`${id}: src/front/index.tsx か src/server/index.ts のどちらかが必要です`);
  }

  const outputs = [];
  if (frontEntry) outputs.push(await buildFront(dir, frontEntry));
  if (serverEntry) outputs.push(await buildServer(dir, serverEntry));
  for (const output of outputs) console.log(`${id}: ${path.relative(ROOT, output)}`);
}

async function main() {
  const filter = process.argv[2];
  const plugins = readPluginDirs(filter);
  if (plugins.length === 0) {
    console.log('repository.json にプラグインがありません');
    return;
  }
  for (const plugin of plugins) await buildPlugin(plugin);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
