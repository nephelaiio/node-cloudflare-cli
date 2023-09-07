import { Command } from 'commander';
import { setVerbose, setQuiet } from '@nephelaiio/logger';
import { zone } from './zone';

import * as fs from 'fs';
import * as dotenv from 'dotenv';

async function main() {
  const envFile = `${process.cwd()}/.env`;
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
  const program = new Command();
  const verbose = (_, v) => v + 1;
  const _checks: Promise<void>[] = [];

  program
    .version(__VERSION__, '--version', 'output the current version')
    .description('cloudflare cli helpers')
    .helpOption('-h, --help', 'output usage information')
    .option('-v, --verbose', 'verbosity that can be increased', verbose, 0)
    .hook('preAction', async (program, _) => {
      (program.opts().verbose > 0 && setVerbose()) || setQuiet();
    });

  zone(program);

  program.parse(process.argv);
}

main();
