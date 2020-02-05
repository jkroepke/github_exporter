/* eslint-disable global-require */
const Octokit = require('@octokit/rest');
/* eslint-enable global-require */

const { scrapeRateLimitRest } = require('../scraper/rate-limits');
const metrics = require('../metrics');
const logger = require('../logger');
const { version } = require('../../package.json');
const { argv } = require('../args');

const octokit = new Octokit({
  auth: argv.token,
  userAgent: `jkroepke/github_exporter v${version}`
});

octokit.hook.before('request', async () => {
  metrics.githubRateAbuseGauge.set({ api: 'rest' }, 0);
});

octokit.hook.after('request', async (response) => {
  scrapeRateLimitRest(response);
});

module.exports = octokit;
