#!/usr/bin/env node
require('dotenv').config();

const flat = require('array.prototype.flat');

flat.shim();

const http = require('http');
const Octokit = require('@octokit/rest');
const interval = require('interval-promise');
const Prometheus = require('prom-client');

const { argv } = require('./lib/args');
const helpers = require('./lib/helpers');
const metrics = require('./lib/metrics');

const { version } = require('./package.json');

const octokit = new Octokit({
  auth: argv.token,
  userAgent: `jkroepke/github_exporter v${version}`,
});

const metricsInterval = Prometheus.collectDefaultMetrics();

(async () => {
  const repositories = [
    ...argv.repository,
    ...await Promise.all(argv.organization.map(
      async (organization) => helpers.getRepositoriesFromOrganization(octokit, organization),
    )),
  ]
    .flat()
    .map(async (repository) => helpers.scrapeRepository(metrics, octokit, repository));

  console.log(`Found ${repositories.length} repositories to scrape ...`);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': Prometheus.register.contentType });
    res.write(Prometheus.register.metrics());
    res.end();
  });

  server.listen(argv.port, argv.listen, (err) => {
    if (err) {
      console.error(`Unable to listen on ${argv.listen}:${argv.port}`, err);
      return;
    }
    console.log(`Listen on ${argv.listen}:${argv.port}`);
  });

  interval(async () => {
    await Promise.all();
  }, argv.interval * 1000);

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
})();
