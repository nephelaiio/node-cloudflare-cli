import { Command } from 'commander';
import { setVerbose, setInfo, setQuiet } from '@nephelaiio/logger';
import { init as initEnvironment } from './environment';
import { zone } from './zone';
import { account } from './account';
import { waf } from './waf';

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
      if (program.opts().verbose > 1) {
        setVerbose();
      } else if (program.opts().verbose == 1) {
        setInfo();
      } else {
        setQuiet();
      }
      await initEnvironment();
    });

  zone(program);
  account(program);
  waf(program);

  program.parse(process.argv);
}

main();
