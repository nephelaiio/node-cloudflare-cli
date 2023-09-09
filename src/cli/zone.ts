import { Command } from 'commander';
import { apiToken } from './environment';
import { api } from '@nephelaiio/cloudflare-api'

const zone = (program: Command) => {
  const command = program.command('zone');

  command.command('list').action(async (_) => {
    const token = apiToken();
    const path = `/zones`;
    const zones = await api({ token, path});
    console.log(JSON.stringify(zones))
  });
};

export { zone };
