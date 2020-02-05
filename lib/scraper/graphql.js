const graphql = require('../github/graphql');
const metrics = require('../metrics');
const logger = require('../logger');

const { scrapeRateLimitGraphql } = require('../scraper/rate-limits');

const maxRepositoriesPerScrape = 50;

const transformRepositoryNameToGraphQlLabel = (name) => name.replace(/[-/.]/g, '_');

const graphQlRepositoryQuery = (repositories) => {
  const graphQlRepositoryQueryParts = repositories.map((repository) => `
    repo_${transformRepositoryNameToGraphQlLabel(repository)}: repository(owner: "${repository.split('/')[0]}", name: "${repository.split('/')[1]}") {
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
    dependencyGraphManifests(first: 0) {
      totalCount
    }
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

${graphQlRepositoryQueryParts}
  
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }`;
};

const processRepositoryGraphQlMetrics = (repository, repositoryMetrics) => {
  try {
    const repoLabel = `repo_${transformRepositoryNameToGraphQlLabel(repository)}`;

    if (!(repoLabel in repositoryMetrics)) {
      // noinspection ExceptionCaughtLocallyJS
      throw Error(`Can't find metrics for repository ${repository} in response.`);
    }

    const repositoryMetric = repositoryMetrics[repoLabel];

    const licence = repositoryMetric.licenseInfo ? repositoryMetric.licenseInfo.name : 'UNLICENSED';
    const language = repositoryMetric.primaryLanguage ? repositoryMetric.primaryLanguage.name : 'UNKNOWN';

    metrics.githubRepoInfoGauge.set({
      repository: repositoryMetric.nameWithOwner,
      forked: String(repositoryMetric.isFork),
      disabled: String(repositoryMetric.isDisabled),
      archived: String(repositoryMetric.isArchived),
      template: String(repositoryMetric.isTemplate),
      owner: repositoryMetric.owner.login,
      licence,
      created_at: Date.parse(repositoryMetric.createdAt) / 1000,
      updated_at: Date.parse(repositoryMetric.updatedAt) / 1000,
      language,
      has_issues: String(repositoryMetric.hasIssuesEnabled),
      has_projects: String(repositoryMetric.hasProjectsEnabled),
      has_wiki: String(repositoryMetric.hasWikiEnabled),
    }, 1);

    metrics.githubRepoStarsGauge.set(
      { repository }, repositoryMetric.stargazers.totalCount,
    );
    metrics.githubRepoWatchersGauge.set(
      { repository }, repositoryMetric.watchers.totalCount,
    );
    metrics.githubRepoForksGauge.set(
      { repository }, repositoryMetric.forkCount,
    );
    metrics.githubRepoIssuesGauge.set(
      { repository, status: 'open' }, repositoryMetric.issuesOpenTotal.totalCount,
    );
    metrics.githubRepoIssuesGauge.set(
      { repository, status: 'closed' }, repositoryMetric.issuesClosedTotal.totalCount,
    );
    metrics.githubRepoPullRequestsGauge.set(
      { repository, status: 'open' }, repositoryMetric.pullRequestsOpenTotal.totalCount,
    );
    metrics.githubRepoPullRequestsGauge.set(
      { repository, status: 'closed' }, repositoryMetric.pullRequestsClosedTotal.totalCount,
    );
    metrics.githubRepoPullRequestsGauge.set(
      { repository, status: 'merged' }, repositoryMetric.pullRequestsMergedTotal.totalCount,
    );
    metrics.githubRepoCommitsGauge.set(
      { repository }, repositoryMetric.commits.history.totalCount,
    );
    metrics.githubRepoTagsGauge.set(
      { repository }, repositoryMetric.tagsTotalCount.totalCount,
    );
    metrics.githubRepoBranchesGauge.set(
      { repository }, repositoryMetric.branchesTotalCount.totalCount,
    );
    metrics.githubRepoPackagesGauge.set(
      { repository }, repositoryMetric.packages.totalCount,
    );
    metrics.githubRepoDependentsGauge.set(
      { repository }, repositoryMetric.dependencyGraphManifests.totalCount,
    );

    metrics.githubRepoScrapedGauge.set({ repository }, 1);
  } catch (err) {
    metrics.githubRepoScrapedGauge.set({ repository }, 0);

    logger.error(`Failed to scrape details from repository ${repository}: ${err.message}`);
  }
};

const scrapeRepositoriesGraphQlDetails = (repositories) => {
  // https://stackoverflow.com/a/37826698/8087167
  const repositoryChunks = repositories.reduce((all, one, i) => {
    const ch = Math.floor(i / maxRepositoriesPerScrape);

    // eslint-disable-next-line no-param-reassign
    all[ch] = [].concat((all[ch] || []), one);

    return all;
  }, []);

  repositoryChunks.forEach((repositoryChunk) => {
    graphql(graphQlRepositoryQuery(repositoryChunk))
      .then((response) => scrapeRateLimitGraphql(response))
      .then((response) => {
        repositoryChunk.forEach(
          (repository) => processRepositoryGraphQlMetrics(repository, response),
        );
      })
      .catch((err) => {
        repositories.forEach(
          (repository) => metrics.githubRepoScrapedGauge.set({ repository }, 0),
        );

        logger.error(`Failed to scrape details from repository ${repositories.join(', ')}: ${err.message}`);
      });
  });
};

module.exports = {
  scrapeRepositoriesGraphQlDetails,
  transformRepositoryNameToGraphQlLabel,
  graphQlRepositoryQuery,
};
