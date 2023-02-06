import gulp from 'gulp';
import fs from 'fs-extra';
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2));

  gulp.task('default', async function(){
  console.log('hello!');
});

const clear = gulp.task('clear', async function() {
  await fs.emptyDir('./dist/')
});


const env = gulp.task('env', async function () {
  var npm = JSON.parse(await fs.readFile('package.json'));

  const envFilePath = './lib/env/data.js';

  await fs.writeFile(envFilePath, Object.entries({
    VERSION: (argv.bump || npm.version).replace(/^v/, '')
  }).map(([key, value]) => {
    return `export const ${key} = ${JSON.stringify(value)};`
  }).join('\n'));
});

const version = gulp.series('env');

export {
  env,
  clear,
  version,
}
