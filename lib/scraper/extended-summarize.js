const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class ExtendedSummarize {
  constructor() {
    this.metrics = {};
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoNetworkGauge: new Prometheus.Gauge({
        name: 'github_repo_network_total',
        help: 'network size for given repository',
        labelNames: ['repository'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/');

      ghRestApi.repos.get({ owner, repo })
        .then((response) => {
          this.metrics.githubRepoNetworkGauge.set({ repository }, response.data.network_count);
        })
        .catch((err) => logger.error(`Failed to scrape repository ${repository} via REST: ${err.message}`));
    });
  }
}

module.exports = ExtendedSummarize;
