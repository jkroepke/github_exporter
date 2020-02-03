#!/usr/bin/env node
require('dotenv').config();

const http = require('http');

const { graphql } = require('@octokit/graphql');

/* eslint-disable global-require */
const Octokit = require('@octokit/rest').plugin([
  require('@octokit/plugin-retry').retry,
  require('@octokit/plugin-throttling').throttling,
]);

/* eslint-enable global-require */

const { argv } = require('./lib/args');
const Scraper = require('./lib/scraper');
const metrics = require('./lib/metrics');

const { version } = require('./package.json');

const octokit = new Octokit({
  auth: argv.token,
  userAgent: `jkroepke/github_exporter v${version}`,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      if (options.request.retryCount === 0) { // only retries once
        console.log(`Retrying after ${retryAfter} seconds!`);
        return true;
      }

      return null;
    },
    onAbuseLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      console.warn(`Abuse detected for request ${options.method} ${options.url}`);
    },
  },
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${argv.token}`,
    'user-agent': `jkroepke/github_exporter v${version}`,
  },
  mediaType: {
    previews: [
      'packages',
      'hawkgirl', // Repositories Dependency Graph
    ],
  },
});

const metricsInterval = metrics.Prometheus.collectDefaultMetrics();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': metrics.Prometheus.register.contentType });
  res.write(metrics.Prometheus.register.metrics());
  res.end();
});

server.listen(argv.port, argv.listen, (err) => {
  if (err) {
    console.error(`Unable to listen on ${argv.listen}:${argv.port}`, err);
    return;
  }
  console.log(`Listen on ${argv.listen}:${argv.port}`);
});

const scraper = new Scraper(metrics, octokit, graphqlWithAuth);
scraper.setInterval(argv.interval * 1000);
scraper.setSpread(argv.spread);

argv.organization.forEach((organization) => {
  scraper.initScrapeOrganization(organization);
});

if (argv.repository.length !== 0) {
  scraper.initScrapeRepositories(argv.repository);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(metricsInterval);

  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    process.exit(0);
  });
});
