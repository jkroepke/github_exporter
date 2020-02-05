#!/usr/bin/env node
require('dotenv').config();

const http = require('http');

const { argv } = require('./lib/args');
const scraper = require('./lib/scraper');
const metrics = require('./lib/metrics');
const logger = require('./lib/logger');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': metrics.Prometheus.register.contentType });
  res.write(metrics.Prometheus.register.metrics());
  res.end();
});

server.listen(argv.port, argv.host, (err) => {
  if (err) {
    logger.error(`Unable to listen on ${argv.host}:${argv.port}`, err);
    logger.verbose(err);
    return;
  }

  logger.info(`Listen on ${argv.host}:${argv.port}`);
});

argv.organization.forEach((organization) => {
  scraper.initScrapeOrganization(organization, argv.interval * 1000, argv.spread);
});

if (argv.repository.length !== 0) {
  scraper.intiScrapeRepositories(argv.repository, argv.interval * 1000, argv.spread);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(metrics.metricsInterval);

  server.close((err) => {
    if (err) {
      logger.error(`Failed to stop server: ${err.message}`);
      logger.verbose(err);
      process.exit(1);
    }

    process.exit(0);
  });
});
