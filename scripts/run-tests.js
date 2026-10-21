import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const projectRoot = resolve(root);
const args = process.argv.slice(2);

function run(cli, cliArgs) {
  const result = spawnSync(process.execPath, [cli, ...cliArgs], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function clean(folder) {
  const target = resolve(projectRoot, folder);
  if (dirname(target) !== projectRoot || !['allure-results', 'allure-report'].includes(folder)) {
    throw new Error(`Refusing to clean unexpected report path: ${target}`);
  }
  rmSync(target, { recursive: true, force: true });
}

const playwrightCli = resolve(projectRoot, 'node_modules/@playwright/test/cli.js');
if (args.includes('--list')) {
  process.exit(run(playwrightCli, ['test', ...args]));
}

const allureCli = resolve(projectRoot, 'node_modules/allure/cli.js');

clean('allure-results');
const testStatus = run(playwrightCli, ['test', ...args]);
clean('allure-report');
const reportStatus = run(allureCli, ['generate', 'allure-results']);
process.exitCode = testStatus || reportStatus;
