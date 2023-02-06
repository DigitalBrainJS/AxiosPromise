import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import autoExternal from 'rollup-plugin-auto-external';
import bundleSize from 'rollup-plugin-bundle-size'
import path from 'path';

const lib = require("./package.json");
const outputFileName = 'axios-promise';
const name = "AxiosPromise";
const namedInput = './lib/index.js';

const buildConfig = ({es5, browser = true, minifiedVersion = true, ...config}) => {
  const {file} = config.output;
  const ext = path.extname(file);
  const basename = path.basename(file, ext);
  const extArr = ext.split('.');
  extArr.shift();


  const build = ({minified}) => ({
    input: namedInput,
    ...config,
    output: {
      ...config.output,
      file: `${path.dirname(file)}/${basename}.${(minified ? ['min', ...extArr] : extArr).join('.')}`
    },
    plugins: [
      json(),
      resolve({browser}),
      commonjs(),
      minified && terser(),
      minified && bundleSize(),
      ...(es5 ? [babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
      })] : []),
      ...(config.plugins || []),
    ]
  });

  const configs = [
    build({minified: false}),
  ];

  if (minifiedVersion) {
    configs.push(build({minified: true}))
  }

  return configs;
};

export default async () => {
  const year = new Date().getFullYear();
  const banner = `// AxiosPromise v${lib.version} Copyright (c) ${year} ${lib.author} and contributors`;

  return [
    // ESM bundle for CDN
    ...buildConfig({
      input: namedInput,
      output: {
        file: `dist/${outputFileName}.mjs`,
        format: "esm",
        preferConst: true,
        exports: "named",
        banner
      }
    }),

    // UMD bundle for CDN
/*    ...buildConfig({
      input: namedInput,
      es5: true,
      output: {
        file: `dist/${outputFileName}.js`,
        name,
        format: "umd",
        exports: "named",
        banner
      }
    }),*/

    // Node.js commonjs bundle
    {
      input: namedInput,
      output: {
        file: `dist/${outputFileName}.cjs`,
        format: "cjs",
        preferConst: true,
        exports: "named",
        banner
      },
      plugins: [
        autoExternal(),
        resolve(),
        commonjs()
      ]
    }
  ]
};
