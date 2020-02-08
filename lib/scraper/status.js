const Prometheus = require('prom-client');
const ghRestApi = require('../github/rest');
const graphql = require('../github/graphql');
const logger = require('../logger');
const helpers = require('../helpers');

const maxRepositoriesPerScrape = 100;

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
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(Status.getQuery(repositoryChunk))
        .then((response) => {
          repositoryChunk.forEach(
            (repository) => {
              const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`;

              if (!(repoLabel in response)) {
                logger.error(`Can't find metrics for repository ${repository} in response.`);
              }

              if (response[repoLabel].defaultBranchRef === null) return;

              this.scrapeStatus(repository, response[repoLabel].defaultBranchRef.name);
            },
          );
        })
        .catch((err) => {
          logger.error(`Failed to scrape vulnerabilities from repository ${repositories.join(', ')}: `, err);
        });
    });
  }

  scrapeStatus(repository, defaultBranch) {
    const [owner, repo] = repository.split('/');

    ghRestApi.repos.getCombinedStatusForRef({ owner, repo, ref: defaultBranch })
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

  static getQuery(repositories) {
    const getQueryParts = repositories.map((repository) => `
    repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}: repository(owner: "${repository.split('/')[0]}", name: "${repository.split('/')[1]}") {
      ...repositoryFragment
    }`).join('\n\n');

    return `fragment repositoryFragment on Repository {
    defaultBranchRef {
      name
    }
  }

  {

${getQueryParts}

    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }`;
  }
}

module.exports = Status;
