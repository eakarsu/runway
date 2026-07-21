const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const root = join(__dirname, '..');
const directories = ['config', 'lib', 'middleware', 'models', 'routes', 'scripts', 'test'];
const files = [join(root, 'index.js')];
for (const directory of directories) {
  const full = join(root, directory);
  for (const name of readdirSync(full)) if (name.endsWith('.js')) files.push(join(full, name));
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}
console.log(`Syntax verified: ${files.length} server files.`);
