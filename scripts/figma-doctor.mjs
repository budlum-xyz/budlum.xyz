import { spawnSync } from 'node:child_process';

const steps = [
  ['npm', ['run', 'figma:sync-missing:check']],
  ['npm', ['run', 'figma:coverage:check']],
  ['npm', ['run', 'figma:plan:check']],
  ['npm', ['run', 'figma:unsupported:check']],
  ['npm', ['run', 'figma:verify']],
];

for (const [command, args] of steps) {
  console.log(`\n▶ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`\nFigma doctor failed at: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}

console.log('\nFigma doctor passed.');
