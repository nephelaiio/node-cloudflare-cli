import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import path from 'path';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import webpack from 'webpack';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve('./.env') });
const project = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'));

export default {
  entry: process.env.SOURCE,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: path.basename(process.env.BUNDLE),
    path: path.resolve(process.cwd(), path.dirname(process.env.BUNDLE))
  },
  optimization: {
    minimizer: []
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(project.version)
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          `echo "#!/usr/bin/env node" | cat - ${process.env.BUNDLE} > temp && mv temp ${process.env.BUNDLE}`,
          `chmod +x ${process.env.BUNDLE}`
        ],
        blocking: true,
        parallel: false
      }
    })
  ]
};
