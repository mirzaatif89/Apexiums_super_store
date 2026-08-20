import { build, preview } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const configFile = path.join(frontendRoot, 'vite.config.js');
const command = process.argv[2] || 'build';

if (command === 'build') {
  await build({
    root: frontendRoot,
    configFile,
  });
} else if (command === 'preview') {
  const server = await preview({
    root: frontendRoot,
    configFile,
    preview: { host: '0.0.0.0', port: 3000 },
  });
  server.printUrls();
} else {
  throw new Error(`Unknown Vite command: ${command}`);
}
