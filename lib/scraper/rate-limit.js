const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class RateLimit {
  constructor() {
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRateLimitLimitGauge: new Prometheus.Gauge({
        name: 'github_rate_limit_limit',
        help: 'GitHub API rate limit limit',
        labelNames: ['api'],
      }),
      githubRateLimitRemainingGauge: new Prometheus.Gauge({
        name: 'github_rate_limit_remaining',
        help: 'GitHub API rate limit remaining',
        labelNames: ['api'],
      }),
      githubRateLimitResetGauge: new Prometheus.Gauge({
        name: 'github_rate_limit_reset',
        help: 'GitHub API rate limit reset',
        labelNames: ['api'],
      }),
    };
  }

  scrapeGlobal() {
    ghRestApi.rateLimit.get()
      .then((response) => {
        ['core', 'search', 'graphql', 'integration_manifest'].forEach((api) => {
          this.metrics.githubRateLimitLimitGauge.set(
            { api },
            response.data.resources[api].limit,
          );

          this.metrics.githubRateLimitRemainingGauge.set(
            { api },
            response.data.resources[api].remaining,
          );

          this.metrics.githubRateLimitResetGauge.set(
            { api },
            response.data.resources[api].reset,
          );
        });
      })
      .catch((err) => logger.error(`Failed to scrape rate-limits via REST: ${err.message}`));
  }
}

module.exports = RateLimit;
