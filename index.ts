#!/usr/bin/env node
import "dotenv/config";

import http from "http";
import * as Prometheus from "prom-client";

import { argv } from "./lib/args.js";
import * as scraper from "./lib/scraper.js";
import logger from "./lib/logger.js";

Prometheus.collectDefaultMetrics();

const server = http.createServer(async (req, res) => {
  switch (req.url) {
    case "/metrics":
      res.writeHead(200, { "Content-Type": Prometheus.register.contentType });
      try {
        const str = await Prometheus.register.metrics();
        res.write(str);
        res.end();
      } catch (err) {
        logger.error(`Failed to get metrics: ${(err as Error).message}`, err);
        res.writeHead(500).end();
      }
      break;
    case "/health":
      res.writeHead(200);
      res.write("OK");
      res.end();
      break;
    case "/":
      res.writeHead(302, { Location: "/metrics" });
      res.write("OK");
      res.end();
      break;
    default:
      res.writeHead(404).end();
      break;
  }
});

server.listen(argv.port, argv.host, (err?: Error) => {
  if (err) {
    logger.error(`Unable to listen on ${argv.host}:${argv.port}`, err);
    logger.verbose(err);
    return;
  }

  logger.info(`Listen on ${argv.host}:${argv.port}`);
});

// Initialize scrapers asynchronously
await scraper.initializeScrapers();

scraper.initScrapeGlobal(argv.interval * 1000, argv.spread);

argv.organization.forEach((organization) => {
  scraper.initScrapeOrganization(organization, argv.interval * 1000, argv.spread);
});

argv.user.forEach((username) => {
  scraper.initScrapeUser(username, argv.interval * 1000, argv.spread);
});

if (argv.repository.length !== 0) {
  scraper.initScrapeRepositories(argv.repository, argv.interval * 1000, argv.spread);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close((err?: Error) => {
    if (err) {
      logger.error(`Failed to stop server: ${err.message}`);
      logger.verbose(err);
      process.exit(1);
    }

    process.exit(0);
  });
});
