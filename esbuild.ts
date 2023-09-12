import { build } from 'esbuild';
import { resolve } from 'path';

import * as dotenv from 'dotenv';

dotenv.config({ path: resolve('./.env') });
const source = process.env.SOURCE;
const bundle = process.env.BUNDLE;

build({
  entryPoints: [`${source}`],
  outfile: `${bundle}`,
  platform: 'node',
  format: 'cjs',
  target: 'esnext',
  minify: false,
  bundle: true
}).catch(() => process.exit(1));
