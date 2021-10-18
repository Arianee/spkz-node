const { execSync } = require('child_process');
const packageJSON = require('./package.json');

execSync('npm i -g  @sentry/cli');

const { version } = packageJSON;

console.log(`starting uploading source map to sentry of version: ${version}`);
execSync(`sentry-cli releases new ${version}`);
execSync(`sentry-cli releases set-commits --auto ${version}`);
execSync(`sentry-cli releases files ${version} upload-sourcemaps dist/ --no-rewrite`);
console.log(`finishing uploading source map to sentry of version: ${version}`);
