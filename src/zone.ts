import { Command } from 'commander';
import { api } from '@nephelaiio/cloudflare-api';

import { apiToken } from './environment';
import { attempt } from './utils';

async function zoneList(zone: string | null = null) {
  const token = apiToken();
  const zones = await api({ token, path: '/zones?per_page=50' });
  if (zone) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return zones.result.filter((z: any) => z.name === zone);
  }
  return zones.result;
}

async function zoneInfo(zone: string) {
  const token = apiToken();
  const zones = await api({ token, path: `/zones?name=${zone}` });
  return zones.result;
}

const zone = (program: Command) => {
  const command = program.command('zone');

  command.command('list').action(
    async (_) =>
      await attempt(async () => {
        const zones = await zoneList();
        console.log(JSON.stringify(zones));
      })
  );

  command
    .command('info')
    .argument('<zone>', 'zone name')
    .action(
      async (zone) =>
        await attempt(async () => {
          const zones = await zoneInfo(zone);
          console.log(JSON.stringify(zones));
        })
    );
};

export { zone, zoneList, zoneInfo };
