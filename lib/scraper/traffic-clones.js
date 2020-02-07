const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class TrafficClones {
  constructor() {
    this.metrics = {};
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoClonesGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['repository'],
      }),
      githubRepoClonesUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['repository'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/');

      ghRestApi.repos.getClones({ owner, repo, per: 'day' })
        .then((response) => {
          response.data.clones.forEach((cloneMetric) => {
            this.metrics.githubRepoClonesGauge.set(
              { repository }, cloneMetric.count, Date.parse(cloneMetric.timestamp),
            );
            this.metrics.githubRepoClonesUniqueGauge.set(
              { repository }, cloneMetric.uniques, Date.parse(cloneMetric.timestamp),
            );
          });
        })
        .catch((err) => logger.error(`Failed to scrape clone metrics for repository ${repository} via REST: ${err.message}`));
    });
  }
}

module.exports = TrafficClones;
