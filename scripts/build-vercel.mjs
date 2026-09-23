import { build } from 'esbuild';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
const output = '.vercel/output';
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp('frontend/dist', `${output}/static`, { recursive: true });
for (const name of ['leads', 'contact', 'quote']) {
  const directory = `${output}/functions/api/${name}.func`;
  await mkdir(directory, { recursive: true });
  await build({
    entryPoints: [`api/${name}/index.ts`],
    outfile: `${directory}/index.mjs`,
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
  });
  await writeFile(
    `${directory}/.vc-config.json`,
    JSON.stringify(
      {
        runtime: 'nodejs22.x',
        handler: 'index.mjs',
        launcherType: 'Nodejs',
        maxDuration: 60,
      },
      null,
      2,
    ),
  );
}
await writeFile(
  `${output}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/api/.*', status: 404 },
        { src: '/', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);
console.log('Frontend e três funções Node preparados em .vercel/output.');
