/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command, Option } from 'commander';
import { debug, info } from '@nephelaiio/logger';
import { api } from '@nephelaiio/cloudflare-api';
import { zoneList } from './zone';

import { apiToken } from './environment';
import { attempt, withValue, constFn } from './utils';

type PackageOptions = {
  zone?: string | null;
  packageName?: string | null;
};
const wafPackageList: (options: PackageOptions) => Promise<any> = async (
  options
) => {
  const zoneMessage = options.zone ? `zone ${options.zone}` : 'all zones';
  const packageMessage = options.packageName
    ? `waf packages matching regex ${options.packageName}`
    : 'all waf packages';
  const message = `Fetching ${packageMessage} for ${zoneMessage}`;
  info(message);
  const { zone = null, packageName = null } = options;
  const token = apiToken();
  const zones = await zoneList(zone);
  const packageQuery = zones.map(async (z) => {
    const zoneId = (await z).id;
    const zoneName = (await z).name;
    const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
    const path = `/zones/${zoneId}/firewall/waf/packages?per_page=50`;
    const result = (await api({ token, path, ignore_errors: [403] })).result;
    const packages = withValue(result)
      .ifThen(constFn(packageName), (r) =>
        (r || []).filter((p: any) => p.name == packageName)
      )
      .value()
      .map(addZoneName);
    return packages;
  });
  const results = await Promise.all(packageQuery);
  const packages = results.flat();
  info(`Retrieved ${packages.length} packages`);
  return packages;
};
const wafPackageRules: (options: PackageOptions) => Promise<any> = async (
  options
) => {
  const zoneMessage = options.zone ? `zone ${options.zone}` : 'all zones';
  const packageMessage = options.packageName
    ? ` matching package name ${packageName(options)}`
    : '';
  info(`Fetching waf rules for ${zoneMessage}${packageMessage}`);
  const packages = await wafPackageList(options);
  const token = apiToken();
  const ruleQuery = packages.map(async (p) => {
    const packageId = (await p).id;
    const zoneId = (await p).zone_id;
    const zoneName = (await p).zone_name;
    const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
    const path = `/zones/${zoneId}/firewall/waf/packages/${packageId}/rules?per_page=50`;
    const result = (await api({ token, path })).result;
    info(`Retrieved ${result.length} rules`);
    return result.map(addZoneName);
  });
  const rules = await Promise.all(ruleQuery);
  return rules.flat();
};
const packageName = (options: any) => {
  const { user, cloudflare, owasp } = options;
  return withValue()
    .ifThen(constFn(user), constFn('USER'))
    .ifThen(constFn(cloudflare), constFn('CloudFlare'))
    .ifThen(constFn(owasp), constFn('OWASP ModSecurity Core Rule Set'))
    .value();
};
const packageAction = (command: Command, action: string) => {
  const verb = command.command(action);
  return verb
    .option('-z, --zone <string>', undefined)
    .addOption(
      new Option('-u, --user', 'user packages')
        .default(true)
        .conflicts(['cloudflare', 'owasp'])
    )
    .addOption(
      new Option('-c, --cloudflare', 'cloudflare packages')
        .default(false)
        .conflicts(['user', 'owasp'])
    )
    .addOption(
      new Option('-o, --owasp', 'owasp packages')
        .default(false)
        .conflicts(['user', 'cloudflare'])
    );
};

const wafRulesetList: (zone: string | null) => Promise<any> = async (zone) => {
  const zoneMessage = zone ? `zone ${zone}` : 'all zones';
  info(`Fetching waf ruleset for ${zoneMessage}`);
  const token = apiToken();
  const zones = await zoneList(zone);
  const rulesetQuery = zones.map(async (z) => {
    const zoneId = (await z).id;
    const zoneName = (await z).name;
    const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
    const path = `/zones/${zoneId}/rulesets?per_page=50`;
    const result = (await api({ token, path })).result;
    return result.map(addZoneName);
  });
  const ruleSets = (await Promise.all(rulesetQuery)).flat();
  return ruleSets;
};
const wafRulesetRules: (
  zone: string | null,
  ruleset: string
) => Promise<any> = async (zone, ruleset) => {
  const zoneMessage = zone ? `zone ${zone}` : 'all zones';
  info(`Fetching waf ruleset for ${zoneMessage}`);
  const token = apiToken();
  const rulesets = await wafRulesetList(zone);
  const ruleQuery = rulesets.map(async (z) => {
    const zoneId = (await z).id;
    const zoneName = (await z).name;
    const addZoneName = (p: any) => ({ ...p, ...{ zone_name: zoneName } });
    const path = `/zones/${zoneId}/rulesets/phases/${ruleset}/entrypoint?per_page=50`;
    const result = (await api({ token, path })).result;
    return result.map(addZoneName);
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
  const pkgCommand = wafCommand.command('package');
  const rsCommand = wafCommand.command('ruleset');

  packageAction(pkgCommand, 'list').action(
    async (options: any) =>
      await attempt(async () => {
        const zone = options.zone;
        debug(
          `Fetching waf packages for zone ${zone} matching name '${packageName(
            options
          )}'`
        );
        const result = await wafPackageList({
          zone,
          packageName: packageName(options)
        });
        console.log(JSON.stringify(result));
      })
  );

  packageAction(pkgCommand, 'rules').action(
    async (options: any) =>
      await attempt(async () => {
        const zone = options.zone;
        debug(
          `Fetching waf package rules for zone ${zone} matching name '${packageName(
            options
          )}'`
        );
        const result = await wafPackageRules({
          zone,
          packageName: packageName(options)
        });
        console.log(JSON.stringify(result));
      })
  );

  rulesetAction(rsCommand, 'list')
    .option('-z, --zone <string>', undefined)
    .action(
      async (options: any) =>
        await attempt(async () => {
          const zone = options.zone;
          debug(`Fetching waf ruleset zone ${zone}`);
          const result = await wafRulesetList(zone);
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
