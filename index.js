#!/usr/bin/env node
require('dotenv').config()

const http = require('http')

const Prometheus = require('prom-client')

const { argv } = require('./lib/args')
const scraper = require('./lib/scraper')
const logger = require('./lib/logger')

const metricsInterval = Prometheus.collectDefaultMetrics()

const server = http.createServer((req, res) => {
  switch (req.url) {
    case '/metrics':
      res.writeHead(200, { 'Content-Type': Prometheus.register.contentType })
      res.write(Prometheus.register.metrics())
      break
    case '/health':
      res.writeHead(200)
      res.write('OK')
      break
    case '/':
      res.writeHead(302, { Location: '/metrics' })
      res.write('OK')
      break
    default:
      res.writeHead(404)
      break
  }

  res.end()
})

server.listen(argv.port, argv.host, (err) => {
  if (err) {
    logger.error(`Unable to listen on ${argv.host}:${argv.port}`, err)
    logger.verbose(err)
    return
  }

  logger.info(`Listen on ${argv.host}:${argv.port}`)
})

scraper.initScrapeGlobal(argv.interval * 1000, argv.spread)

argv.organization.forEach((organization) => {
  scraper.initScrapeOrganization(organization, argv.interval * 1000, argv.spread)
})

argv.user.forEach((username) => {
  scraper.initScrapeUser(username, argv.interval * 1000, argv.spread)
})

if (argv.repository.length !== 0) {
  scraper.initScrapeRepositories(argv.repository, argv.interval * 1000, argv.spread)
}

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(metricsInterval)

  server.close((err) => {
    if (err) {
      logger.error(`Failed to stop server: ${err.message}`)
      logger.verbose(err)
      process.exit(1)
    }

    process.exit(0)
  })
})
