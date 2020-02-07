const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const logger = require('../logger');

class Status {
  constructor() {
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoStatusGauge: new Prometheus.Gauge({
        name: 'github_repo_status',
        help: 'status for the default branch for given repository',
        labelNames: ['repository', 'context'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/');

      ghRestApi.repos.getCombinedStatusForRef({ owner, repo, ref: 'master' })
        .then((response) => {
          this.metrics.githubRepoStatusGauge.reset();

          response.data.statuses.forEach((status) => {
            this.metrics.githubRepoStatusGauge.set(
              { repository, context: status.context },
              Status.stateToMetric(status.state),
            );
          });
        })
        .catch((err) => logger.error(`Failed to scrape status from repository ${repository} via REST: ${err.message}`));
    });
  }

  static stateToMetric(state) {
    const map = {
      success: 0,
      error: 1,
      failure: 2,
      pending: 3,
    };

    if (state in map) {
      return map[state];
    }

    return -1;
  }
}

module.exports = Status;
