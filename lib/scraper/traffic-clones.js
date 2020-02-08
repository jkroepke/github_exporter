const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class TrafficClones {
  constructor() {
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoClonesGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoClonesUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository'],
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
              { owner, repository }, cloneMetric.count,
            );
            this.metrics.githubRepoClonesUniqueGauge.set(
              { owner, repository }, cloneMetric.uniques,
            );
          });
        })
        .catch((err) => logger.error(`Failed to scrape clone metrics for repository ${repository} via REST: ${err.message}`, err));
    });
  }
}

module.exports = TrafficClones;
