const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class TrafficTopReferrers {
  constructor() {
    this.metrics = {};
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoViewsGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_views',
        help: 'Total views from top 10 content for given repository',
        labelNames: ['repository'],
      }),
      githubRepoViewsUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_vistors',
        help: 'Total unique views from top 10 content for given repository',
        labelNames: ['repository'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/');
      ghRestApi.repos.getViews({ owner, repo })
        .then((response) => {
          response.data.views.forEach((viewMetric) => {
            this.metrics.githubRepoViewsGauge.set(
              { repository }, viewMetric.count, Date.parse(viewMetric.timestamp),
            );
            this.metrics.githubRepoViewsUniqueGauge.set(
              { repository }, viewMetric.uniques, Date.parse(viewMetric.timestamp),
            );
          });
        })
        .catch((err) => logger.error(`Failed to scrape view metrics for repository ${repository} via REST: ${err.message}`));
    });
  }
}

module.exports = TrafficTopReferrers;
