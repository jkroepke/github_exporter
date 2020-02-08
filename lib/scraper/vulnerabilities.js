const Prometheus = require('prom-client');
const graphql = require('../github/graphql');
const logger = require('../logger');
const helpers = require('../helpers');

const maxRepositoriesPerScrape = 50;

class Vulnerabilities {
  constructor() {
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      // TODO: label for dismissed alerts
      githubRepoVulnerabilitiesGauge: new Prometheus.Gauge({
        name: 'github_repo_vulnerabilities_total',
        help: 'vulnerabilities for given repository',
        labelNames: ['repository'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(Vulnerabilities.getQuery(repositoryChunk))
        .then((response) => {
          repositoryChunk.forEach(
            (repository) => {
              const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`;

              if (!(repoLabel in response)) {
                logger.error(`Can't find metrics for repository ${repository} in response.`);
              }

              this.metrics.githubRepoVulnerabilitiesGauge.set(
                { repository },
                response[repoLabel].vulnerabilityAlerts.totalCount,
              );
            },
          );
        })
        .catch((err) => {
          logger.error(`Failed to scrape vulnerabilities from repository ${repositories.join(', ')}: `, err);
        });
    });
  }

  static getQuery(repositories) {
    const getQueryParts = repositories.map((repository) => `
    repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}: repository(owner: "${repository.split('/')[0]}", name: "${repository.split('/')[1]}") {
      ...repositoryFragment
    }`).join('\n\n');

    return `fragment repositoryFragment on Repository {
    vulnerabilityAlerts(first: 0) {
      totalCount
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

module.exports = Vulnerabilities;
