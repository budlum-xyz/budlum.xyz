import { spawnSync } from 'node:child_process';

const steps = [
  { command: 'npm', args: ['run', 'figma:sync-missing:check'] },
  { command: 'npm', args: ['run', 'figma:coverage:check'] },
  { command: 'npm', args: ['run', 'figma:plan:check'] },
  { command: 'npm', args: ['run', 'figma:unsupported:check'] },
  { command: 'npm', args: ['run', 'figma:image-filters:check'] },
  { command: 'npm', args: ['run', 'figma:paint-stacks:check'] },
  { command: 'npm', args: ['run', 'figma:text-strokes:check'] },
  { command: 'npm', args: ['run', 'figma:fonts:check'] },
  { command: 'npm', args: ['run', 'figma:images:check'] },
  { command: 'npm', args: ['ci', '--no-audit', '--fund=false'], cwd: 'tools/design-import', label: 'npm ci (OpenFig tooling)' },
  { command: 'npm', args: ['run', 'figma:openfig:resolve:check'] },
  { command: 'npm', args: ['run', 'figma:openfig:interactions:check'] },
  { command: 'npm', args: ['run', 'figma:verify'] },
];

for (const step of steps) {
  const label = step.label || `${step.command} ${step.args.join(' ')}`;
  const cwdLabel = step.cwd ? ` [cwd=${step.cwd}]` : '';
  console.log(`\n▶ ${label}${cwdLabel}`);
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`\nFigma doctor failed at: ${label}${cwdLabel}`);
    process.exit(result.status || 1);
  }
}

console.log('\nFigma doctor passed.');
