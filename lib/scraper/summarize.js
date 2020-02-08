const Prometheus = require('prom-client');
const graphql = require('../github/graphql');
const logger = require('../logger');
const helpers = require('../helpers');

const maxRepositoriesPerScrape = 50;

class Summarize {
  constructor() {
    this.registerMetrics();
  }

  registerMetrics() {
    this.metrics = {
      githubRepoScrapedGauge: new Prometheus.Gauge({
        name: 'github_repo_scraped',
        help: 'Successfully scraped a repository',
        labelNames: ['repository'],
      }),
      githubRepoInfoGauge: new Prometheus.Gauge({
        name: 'github_repo_info',
        help: 'Information about given repository',
        labelNames: [
          'repository', 'disabled', 'forked', 'archived', 'owner', 'licence', 'created_at', 'updated_at',
          'language', 'has_issues', 'has_projects', 'has_wiki', 'template',
        ],
      }),
      githubRepoIssuesGauge: new Prometheus.Gauge({
        name: 'github_repo_issues_total',
        help: 'Issues for given repository',
        labelNames: ['repository', 'status'],
      }),
      githubRepoPullRequestsGauge: new Prometheus.Gauge({
        name: 'github_repo_pull_request_total',
        help: 'Pull requests for given repository',
        labelNames: ['repository', 'status'],
      }),
      githubRepoWatchersGauge: new Prometheus.Gauge({
        name: 'github_repo_watchers_total',
        help: 'Total number of watchers/subscribers for given repository',
        labelNames: ['repository'],
      }),
      githubRepoStarsGauge: new Prometheus.Gauge({
        name: 'github_repo_stars_total',
        help: 'Total number of Stars for given repository',
        labelNames: ['repository'],
      }),
      githubRepoForksGauge: new Prometheus.Gauge({
        name: 'github_repo_fork_total',
        help: 'Total number of forks for given repository',
        labelNames: ['repository'],
      }),
      githubRepoCommitsGauge: new Prometheus.Gauge({
        name: 'github_repo_commits',
        help: 'Total number of commits for given repository',
        labelNames: ['repository'],
      }),
      githubRepoTagsGauge: new Prometheus.Gauge({
        name: 'github_repo_tags_total',
        help: 'Total number of tags for given repository',
        labelNames: ['repository'],
      }),
      githubRepoBranchesGauge: new Prometheus.Gauge({
        name: 'github_repo_branches_total',
        help: 'Total number of branches for given repository',
        labelNames: ['repository'],
      }),
      githubRepoPackagesGauge: new Prometheus.Gauge({
        name: 'github_repo_packages',
        help: 'Total number of packages for given repository',
        labelNames: ['repository'],
      }),
      githubRepoDownloadsGauge: new Prometheus.Gauge({
        name: 'github_repo_downloads',
        help: 'Total number of releases for given repository',
        labelNames: ['repository', 'release', 'url'],
      }),
      githubRepoReleasesGauge: new Prometheus.Gauge({
        name: 'github_repo_releases',
        help: 'Total number of releases for given repository',
        labelNames: ['repository'],
      }),
    };
  }

  scrapeRepositories(repositories) {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(Summarize.getQuery(repositoryChunk))
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
            (repository) => this.metrics.githubRepoScrapedGauge.set({ repository }, 0),
          );

          logger.error(`Failed to scrape details from repository ${repositories.join(', ')}: `, err);
        });
    });
  }

  static getQuery(repositories) {
    const getQueryParts = repositories.map((repository) => `
    repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}: repository(owner: "${repository.split('/')[0]}", name: "${repository.split('/')[1]}") {
      ...repositoryFragment
    }`).join('\n\n');

    return `fragment repositoryFragment on Repository {
    name
    nameWithOwner
    owner {
      login
    }
    description
    createdAt
    updatedAt
    pushedAt
    isFork
    isDisabled
    isArchived
    isTemplate
    diskUsage
    hasWikiEnabled
    hasProjectsEnabled
    hasIssuesEnabled
    primaryLanguage {
      name
    }
    licenseInfo {
      name
    }
    forkCount
    packages(first: 0) {
      totalCount
    }
    stargazers(first: 0) {
      totalCount
    }
    watchers(first: 0) {
      totalCount
    }
    commits: object(expression: "master") {
      ... on Commit {
        history {
          totalCount
        }
      }
    }
    releases {
      totalCount
    }
    releases {
      nodes {
        tagName
        releaseAssets(first: 50) {
          nodes {
            downloadUrl
            downloadCount
          }
        }
      }
    }
    branchesTotalCount: refs(first: 0, refPrefix: "refs/heads/") {
      totalCount
    }
    tagsTotalCount: refs(first: 0, refPrefix: "refs/tags/") {
      totalCount
    }
    pullRequestsOpenTotal: pullRequests(first: 0, states: OPEN) {
      totalCount
    }
    pullRequestsClosedTotal: pullRequests(first: 0, states: CLOSED) {
      totalCount
    }
    pullRequestsMergedTotal: pullRequests(first: 0, states: MERGED) {
      totalCount
    }
    issuesOpenTotal: issues(first: 0, states: OPEN) {
      totalCount
    }
    issuesClosedTotal: issues(first: 0, states: CLOSED) {
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

  process(repository, repositoryMetrics) {
    try {
      const licence = repositoryMetrics.licenseInfo ? repositoryMetrics.licenseInfo.name : 'UNLICENSED';
      const language = repositoryMetrics.primaryLanguage ? repositoryMetrics.primaryLanguage.name : 'UNKNOWN';

      const commitCount = repositoryMetrics.commits.history
        ? repositoryMetrics.commits.history.totalCount
        : 0;

      this.metrics.githubRepoInfoGauge.set({
        repository: repositoryMetrics.nameWithOwner,
        forked: String(repositoryMetrics.isFork),
        disabled: String(repositoryMetrics.isDisabled),
        archived: String(repositoryMetrics.isArchived),
        template: String(repositoryMetrics.isTemplate),
        owner: repositoryMetrics.owner.login,
        licence,
        created_at: Date.parse(repositoryMetrics.createdAt) / 1000,
        updated_at: Date.parse(repositoryMetrics.updatedAt) / 1000,
        language,
        has_issues: String(repositoryMetrics.hasIssuesEnabled),
        has_projects: String(repositoryMetrics.hasProjectsEnabled),
        has_wiki: String(repositoryMetrics.hasWikiEnabled),
      }, 1);

      this.metrics.githubRepoStarsGauge.set(
        { repository }, repositoryMetrics.stargazers.totalCount,
      );
      this.metrics.githubRepoWatchersGauge.set(
        { repository }, repositoryMetrics.watchers.totalCount,
      );
      this.metrics.githubRepoForksGauge.set(
        { repository }, repositoryMetrics.forkCount,
      );
      this.metrics.githubRepoIssuesGauge.set(
        { repository, status: 'open' }, repositoryMetrics.issuesOpenTotal.totalCount,
      );
      this.metrics.githubRepoIssuesGauge.set(
        { repository, status: 'closed' }, repositoryMetrics.issuesClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { repository, status: 'open' }, repositoryMetrics.pullRequestsOpenTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { repository, status: 'closed' }, repositoryMetrics.pullRequestsClosedTotal.totalCount,
      );
      this.metrics.githubRepoPullRequestsGauge.set(
        { repository, status: 'merged' }, repositoryMetrics.pullRequestsMergedTotal.totalCount,
      );
      this.metrics.githubRepoCommitsGauge.set(
        { repository }, commitCount,
      );
      this.metrics.githubRepoTagsGauge.set(
        { repository }, repositoryMetrics.tagsTotalCount.totalCount,
      );
      this.metrics.githubRepoBranchesGauge.set(
        { repository }, repositoryMetrics.branchesTotalCount.totalCount,
      );
      this.metrics.githubRepoPackagesGauge.set(
        { repository }, repositoryMetrics.packages.totalCount,
      );
      this.metrics.githubRepoReleasesGauge.set(
        { repository }, repositoryMetrics.releases.totalCount,
      );

      repositoryMetrics.releases.nodes.forEach((release) => {
        release.releaseAssets.nodes.forEach((asset) => {
          this.metrics.githubRepoDownloadsGauge.set(
            { repository, release: release.tagName, url: asset.downloadUrl }, asset.downloadCount,
          );
        });
      });

      this.metrics.githubRepoScrapedGauge.set({ repository }, 1);
    } catch (err) {
      this.metrics.githubRepoScrapedGauge.set({ repository }, 0);

      logger.error(`Failed to scrape details from repository ${repository}: ${err.message}`);
    }
  }
}

module.exports = Summarize;
