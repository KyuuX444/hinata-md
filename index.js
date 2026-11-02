import { execSync } from 'node:child_process';

console.log('[Hinata-MD] Compiling TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });
console.log('[Hinata-MD] Build completed successfully. Starting Hinata MD...');

await import('./dist/src/index.js');
