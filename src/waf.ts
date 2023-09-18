/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from 'commander';
import { debug, info } from '@nephelaiio/logger';
import { api } from '@nephelaiio/cloudflare-api';
import { zoneList, zoneInfo } from './zone';

import { apiToken } from './environment';
import { attempt } from './utils';

const wafRulesetList: (
  zone: string | null,
  ruleset: string | null
) => Promise<any> = async (zone, ruleset) => {
  const zoneMessage = zone ? `zone ${zone}` : 'all zones';
  info(`Fetching waf ruleset for ${zoneMessage}`);
  const token = apiToken();
  const zones = () => (zone ? zoneInfo(zone) : zoneList());
  const rulesetQuery = (await zones()).map(async (z) => {
    const zoneId = (await z).id;
    const zoneName = (await z).name;
    const addZoneInfo = (p: any) => ({
      ...p,
      ...{ zone_name: zoneName, zone_id: zoneId }
    });
    const path = `/zones/${zoneId}/rulesets?per_page=50`;
    const result = (await api({ token, path })).result;
    return result.map(addZoneInfo);
  });
  const rulesetList = (await Promise.all(rulesetQuery)).flat();
  const rulesets = () =>
    ruleset ? rulesetList.filter((r) => r.phase == ruleset) : rulesetList;
  return rulesets();
};
const wafRulesetRules: (
  zone: string | null,
  ruleset: string
) => Promise<any> = async (zone, ruleset) => {
  const zoneMessage = zone ? `zone ${zone}` : 'all zones';
  info(`Fetching waf rules for ${zoneMessage}`);
  const token = apiToken();
  const rulesets = await wafRulesetList(zone, ruleset);
  const ruleQuery = rulesets.map(async (z) => {
    const zoneId = (await z).zone_id;
    const rulesetId = (await z).id;
    const zoneName = (await z).zone_name;
    const addZoneInfo = (p: any) => ({
      ...p,
      ...{ zone_name: zoneName, zone_id: zoneId, ruleset_id: rulesetId }
    });
    const path = `/zones/${zoneId}/rulesets/phases/${ruleset}/entrypoint?per_page=50`;
    const result = (await api({ token, path })).result;
    return result.rules.map(addZoneInfo);
  });
  const rules = (await Promise.all(ruleQuery)).flat();
  return rules;
};
const rulesetAction = (command: Command, action: string) => {
  const verb = command.command(action);
  return verb.option('-z, --zone <string>', undefined);
};

const waf = (program: Command) => {
  const wafCommand = program.command('waf');
  const rsCommand = wafCommand.command('ruleset');

  rulesetAction(rsCommand, 'list')
    .option('-z, --zone <string>', undefined)
    .option('-p, --phase <string>', undefined)
    .action(
      async (options: any) =>
        await attempt(async () => {
          const zone = options.zone;
          const phase = options.phase;
          debug(`Fetching waf ruleset zone ${zone}`);
          const result = await wafRulesetList(zone, phase);
          console.log(JSON.stringify(result));
        })
    );

  rulesetAction(rsCommand, 'custom')
    .option('-z, --zone <string>', undefined)
    .action(
      async (options: any) =>
        await attempt(async () => {
          const zone = options.zone;
          debug(`Fetching waf custom rules for zone ${zone}`);
          const result = await wafRulesetRules(
            zone,
            'http_request_firewall_custom'
          );
          console.log(JSON.stringify(result));
        })
    );

  rulesetAction(rsCommand, 'rate-limit')
    .option('-z, --zone <string>', undefined)
    .action(
      async (options: any) =>
        await attempt(async () => {
          const zone = options.zone;
          debug(`Fetching waf custom rules for zone ${zone}`);
          const result = await wafRulesetRules(zone, 'http_ratelimit');
          console.log(JSON.stringify(result));
        })
    );
};

export { waf };
