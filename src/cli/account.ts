import { Command } from 'commander';
import { api } from '@nephelaiio/cloudflare-api'
import { apiToken } from './environment';

const account = (program: Command) => {
  const command = program.command('account');

  command.command('list').action(async (_) => {
    const token = apiToken();
    const path = `/accounts`;
    const zones = await api({ token, path});
    console.log(JSON.stringify(zones));
  });
};

export { account };
