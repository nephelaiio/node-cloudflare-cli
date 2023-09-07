import { Command } from 'commander';
import { debug } from '@nephelaiio/logger';

const zone = (program: Command) => {

  const command = program.command('zone');

  command.command('list').action(async (_) => {
    const action = async () => {
      debug(`Listing zones for account`);
    };
    await action();
  });

}

export { zone };
