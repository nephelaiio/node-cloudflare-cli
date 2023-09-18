import { Command } from 'commander';
import { zoneInfo } from '@nephelaiio/cloudflare-api';

import { apiToken } from './environment';
import { attempt } from './utils';

const token = apiToken();

const zone = (program: Command) => {
  const command = program.command('zone');

  command.command('list').action(
    async (_) =>
      await attempt(async () => {
        const zones = await zoneInfo({ token });
        console.log(JSON.stringify(zones));
      })
  );

  command
    .command('info')
    .argument('<zone>', 'zone name')
    .action(
      async (zone) =>
        await attempt(async () => {
          const zones = await zoneInfo({ token, zone });
          console.log(JSON.stringify(zones));
        })
    );
};

export { zone, zoneList, zoneInfo };
