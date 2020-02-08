const Prometheus = require('prom-client');
const fs = require('fs');
const graphql = require('../github/graphql');
const logger = require('../logger');
const helpers = require('../helpers');

const maxRepositoriesPerScrape = 50;

class Summarize {
  constructor() {
    this.registerMetrics();
    this.loadQueryTemplate();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoScrapedGauge: new Prometheus.Gauge({
        name: 'github_repo_scraped',
        help: 'Successfully scraped a repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoInfoGauge: new Prometheus.Gauge({
        name: 'github_repo_info',
        help: 'Information about given repository',
        labelNames: [
          'owner', 'repository', 'disabled', 'forked', 'archived', 'licence', 'created_at',
          'updated_at', 'pushed_at', 'language', 'has_issues', 'has_projects', 'has_wiki', 'template',
        ],
      }),
      githubRepoIssuesGauge: new Prometheus.Gauge({
        name: 'github_repo_issues_total',
        help: 'Issues for given repository',
        labelNames: ['owner', 'repository', 'status'],
      }),
      githubRepoPullRequestsGauge: new Prometheus.Gauge({
        name: 'github_repo_pull_request_total',
        help: 'Pull requests for given repository',
        labelNames: ['owner', 'repository', 'status'],
      }),
      githubRepoWatchersGauge: new Prometheus.Gauge({
        name: 'github_repo_watchers_total',
        help: 'Total number of watchers/subscribers for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoStarsGauge: new Prometheus.Gauge({
        name: 'github_repo_stars_total',
        help: 'Total number of Stars for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoForksGauge: new Prometheus.Gauge({
        name: 'github_repo_fork_total',
        help: 'Total number of forks for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoCommitsGauge: new Prometheus.Gauge({
        name: 'github_repo_commits',
        help: 'Total number of commits for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoTagsGauge: new Prometheus.Gauge({
        name: 'github_repo_tags_total',
        help: 'Total number of tags for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoBranchesGauge: new Prometheus.Gauge({
        name: 'github_repo_branches_total',
        help: 'Total number of branches for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoPackagesGauge: new Prometheus.Gauge({
        name: 'github_repo_packages',
        help: 'Total number of packages for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoDownloadsGauge: new Prometheus.Gauge({
        name: 'github_repo_downloads',
        help: 'Total number of releases for given repository',
        labelNames: ['owner', 'repository', 'release', 'url'],
      }),
      githubRepoReleasesGauge: new Prometheus.Gauge({
        name: 'github_repo_releases',
        help: 'Total number of releases for given repository',
        labelNames: ['owner', 'repository'],
      }),

      // TODO: label for dismissed alerts
      githubRepoVulnerabilitiesGauge: new Prometheus.Gauge({
        name: 'github_repo_vulnerabilities_total',
        help: 'vulnerabilities for given repository',
        labelNames: ['owner', 'repository'],
      }),
      githubRepoLanguagesGauge: new Prometheus.Gauge({
        name: 'github_repo_languages_size',
        help: 'return repo size by langauges for given repository',
        labelNames: ['owner', 'repository', 'language'],
      }),
    };
  }

  loadQueryTemplate() {
    this.graphqlQuery = fs.readFileSync('./templates/graphql/summarize.graphql', 'utf8');
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

              this.process(repository, response[repoLabel]);
            },
          );
        })
        .catch((err) => {
          repositories.forEach(
            (repository) => this.metrics.githubRepoScrapedGauge.set({
              owner: repository.split('/')[0],
              repository,
            }, 0),
          );

          logger.error(`Failed to scrape details from repository ${repositories.join(', ')}: `, err);
        });
    });
  }

  getQuery(repositories) {
    return [this.graphqlQuery, '{', helpers.generateGraphqlRepositoryQueries(repositories), '}'].join('\n');
  }

  process(repository, repositoryMetrics) {
    const [owner] = repository.split('/');

    try {
      const licence = repositoryMetrics.licenseInfo ? repositoryMetrics.licenseInfo.name : 'UNLICENSED';
      const language = repositoryMetrics.primaryLanguage ? repositoryMetrics.primaryLanguage.name : 'UNKNOWN';

      // Handle empty repositories
      const commitCount = repositoryMetrics.commits !== null
        ? repositoryMetrics.commits.history.totalCount
        : 0;

      const vulnerabilityAlerts = repositoryMetrics.vulnerabilityAlerts !== null
        ? repositoryMetrics.vulnerabilityAlerts.totalCount
        : -1;

      this.metrics.githubRepoInfoGauge.set({
        owner,
        repository: repositoryMetrics.nameWithOwner,
        forked: String(repositoryMetrics.isFork),
        disabled: String(repositoryMetrics.isDisabled),
        archived: String(repositoryMetrics.isArchived),
        template: String(repositoryMetrics.isTemplate),
        licence,
        created_at: Date.parse(repositoryMetrics.createdAt),
        updated_at: Date.parse(repositoryMetrics.updatedAt),
        pushed_at: Date.parse(repositoryMetrics.pushedAt),
        language,
        has_issues: String(repositoryMetrics.hasIssuesEnabled),
        has_projects: String(repositoryMetrics.hasProjectsEnabled),
        has_wiki: String(repositoryMetrics.hasWikiEnabled),
      }, 1);

      this.metrics.githubRepoStarsGauge.set(
        { owner, repository }, repositoryMetrics.stargazers.totalCount,
      );
      this.metrics.githubRepoWatchersGauge.set(
        { owner, repository }, repositoryMetrics.watchers.totalCount,
      );
      this.metrics.githubRepoForksGauge.set(
        { owner, repository }, repositoryMetrics.forkCount,
      );
      this.metrics.githubRepoIssuesGauge.set(
        { owner, repository, status: 'open' }, repositoryMetrics.issuesOpenTotal.totalCount,
      );
      this.metrics.githubRepoIssuesGauge.set(
        { owner, repository, status: 'closed' }, repositoryMetrics.issuesClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: 'open' }, repositoryMetrics.pullRequestsOpenTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: 'closed' }, repositoryMetrics.pullRequestsClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { owner, repository, status: 'merged' }, repositoryMetrics.pullRequestsMergedTotal.totalCount,
      );
      this.metrics.githubRepoCommitsGauge.set(
        { owner, repository }, commitCount,
      );
      this.metrics.githubRepoTagsGauge.set(
        { owner, repository }, repositoryMetrics.tagsTotalCount.totalCount,
      );
      this.metrics.githubRepoBranchesGauge.set(
        { owner, repository }, repositoryMetrics.branchesTotalCount.totalCount,
      );
      this.metrics.githubRepoPackagesGauge.set(
        { owner, repository }, repositoryMetrics.packages.totalCount,
      );
      this.metrics.githubRepoReleasesGauge.set(
        { owner, repository }, repositoryMetrics.releases.totalCount,
      );

      repositoryMetrics.releases.nodes.forEach((release) => {
        release.releaseAssets.nodes.forEach((asset) => {
          this.metrics.githubRepoDownloadsGauge.set(
            {
              owner, repository, release: release.tagName, url: asset.downloadUrl,
            },
            asset.downloadCount,
          );
        });
      });

      this.metrics.githubRepoVulnerabilitiesGauge.set(
        { owner, repository },
        vulnerabilityAlerts,
      );

      repositoryMetrics.languages.edges.forEach((languageDetail) => {
        this.metrics.githubRepoLanguagesGauge.set({
          owner,
          repository,
          language: languageDetail.node.name,
        }, languageDetail.size);
      });

      this.metrics.githubRepoScrapedGauge.set({ owner, repository }, 1);
    } catch (err) {
      this.metrics.githubRepoScrapedGauge.set({ owner, repository }, 0);

      logger.error(`Failed to scrape details from repository ${repository}: ${err.message}`, err);
    }
  }
}

module.exports = Summarize;
