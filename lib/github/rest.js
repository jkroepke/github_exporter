const { Octokit } = require('@octokit/rest');

const { version } = require('../../package.json');
const { argv } = require('../args');
const logger = require('../logger');

const options = {
  userAgent: `github_exporter/${version} (jkroepke/github_exporter; +https://github.com/jkroepke/github_exporter)`,
  log: {
    debug: (message, additionalInfo) => logger.debug(message, additionalInfo),
    info: (message, additionalInfo) => logger.verbose(message, additionalInfo),
    warn: (message, additionalInfo) => logger.warn(message, additionalInfo),
    error: (message, additionalInfo) => logger.error(message, additionalInfo),
  },
};

if (argv.token) {
  options.auth = argv.token;
}

const octokit = new Octokit(options);

module.exports = octokit;
