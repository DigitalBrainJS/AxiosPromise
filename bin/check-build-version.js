import fs from 'fs';
import assert from 'assert';
import {AxiosPromise} from '../lib/index.js';
import {AxiosPromise as AxiosPromiseBuild} from '../dist/axios-promise.cjs';

const {version} = JSON.parse(fs.readFileSync('./package.json'));

console.log('Checking versions...\n----------------------------')

console.log(`Package version: v${version}`);
console.log(`AxiosPromise version: v${AxiosPromise.VERSION}`);
console.log(`AxiosPromise build version: v${AxiosPromiseBuild.VERSION}`);
console.log(`----------------------------`);

assert.strictEqual(
  version,
  AxiosPromise.VERSION,
  `Version mismatch between package and AxiosPromise ${version} != ${AxiosPromise.VERSION}`
);

assert.strictEqual(
  version,
  AxiosPromiseBuild.VERSION,
  `Version mismatch between package and build ${version} != ${AxiosPromiseBuild.VERSION}`
);

console.log('✔️ PASSED\n');


