const Octokit = require('@octokit/rest');

const { version } = require('../../package.json');
const { argv } = require('../args');

const options = {
  userAgent: `github_exporter/${version} (jkroepke/github_exporter; +https://github.com/jkroepke/github_exporter)`,
};

if (argv.token) {
  options.auth = argv.token;
}

const octokit = new Octokit(options);

module.exports = octokit;
