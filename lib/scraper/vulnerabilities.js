const Prometheus = require('prom-client');
const fs = require('fs');
const graphql = require('../github/graphql');
const logger = require('../logger');
const helpers = require('../helpers');

const maxRepositoriesPerScrape = 50;

class Vulnerabilities {
  constructor() {
    this.registerMetrics();
    this.loadQueryTemplate();
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

  loadQueryTemplate() {
    this.graphqlQuery = fs.readFileSync('./templates/graphql/vulnerabilities.graphql', 'utf8');
  }

  scrapeRepositories(repositories) {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(this.getQuery(repositoryChunk))
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

  getQuery(repositories) {
    return [this.graphqlQuery, '{', helpers.generateGraphqlRepositoryQueries(repositories), '}'].join('\n');
  }
}

module.exports = Vulnerabilities;
