const parallel = require('run-parallel');
const each = require('async-each');

const graphqlHelper = require('./graphql');


class Scraper {
  constructor(metrics, octokit, graphql) {
    this.metrics = metrics;
    this.octokit = octokit;
    this.graphql = graphql;
    this.interval = 0;
    this.spread = false;

    this.maxRepositoriesPerScrape = 50;
  }

  setInterval(interval) {
    this.interval = interval;
  }

  setSpread(spread) {
    this.spread = spread;
  }

  initScrapeOrganization(organization) {
    const startScrape = this.spread ? Math.round(this.interval * Math.random()) : 0;

    const scrapeHandler = () => {
      const options = this.octokit.repos.listForOrg.endpoint.merge({
        org: organization,
      });

      this.octokit.paginate(
        options,
        (response) => {
          this.scrapeRateLimit(response);
          return response.data.map((repository) => repository.full_name);
        },
      )
        .then((repositories) => this.scrapeRepositories(repositories));
    };

    setTimeout(() => {
      scrapeHandler();
      setInterval(scrapeHandler, this.interval);
    }, startScrape);
  }

  initScrapeRepositories(repositories) {
    const startScrape = this.spread ? Math.round(this.interval * Math.random()) : 0;

    const scrapeHandler = () => {
      this.scrapeRepositories(repositories);
    };

    setTimeout(() => {
      scrapeHandler();
      setInterval(scrapeHandler, this.interval);
    }, startScrape);
  }

  scrapeRateLimit(response) {
    if (response.rateLimit) {
      if ('limit' in response.rateLimit) {
        this.metrics.githubRateLimitLimitGauge.set(
          { api: 'graphql' },
          Number(response.rateLimit.limit),
        );
      }
      if ('remaining' in response.rateLimit) {
        this.metrics.githubRateLimitRemainingGauge.set(
          { api: 'graphql' },
          Number(response.rateLimit.remaining),
        );
      }
      if ('resetAt' in response.rateLimit) {
        this.metrics.githubRateLimitResetGauge.set(
          { api: 'graphql' },
          Number(Date.parse(response.rateLimit.resetAt) / 1000),
        );
      }
    } else if (response.headers) {
      if ('x-ratelimit-limit' in response.headers) {
        this.metrics.githubRateLimitLimitGauge.set(
          { api: 'rest' },
          Number(response.headers['x-ratelimit-limit']),
        );
      }
      if ('x-ratelimit-remaining' in response.headers) {
        this.metrics.githubRateLimitRemainingGauge.set(
          { api: 'rest' },
          Number(response.headers['x-ratelimit-remaining']),
        );
      }
      if ('x-ratelimit-reset' in response.headers) {
        this.metrics.githubRateLimitResetGauge.set(
          { api: 'rest' },
          Number(response.headers['x-ratelimit-reset']),
        );
      }
    }

    return response;
  }

  scrapeRepositories(repositories) {
    parallel({
      graphql: () => {
        // https://stackoverflow.com/a/37826698/8087167
        const repositoryChunks = repositories.reduce((all, one, i) => {
          const ch = Math.floor(i / this.maxRepositoriesPerScrape);

          // eslint-disable-next-line no-param-reassign
          all[ch] = [].concat((all[ch] || []), one);

          return all;
        }, []);

        repositoryChunks.forEach((repositoryChunk) => {
          this.graphql(graphqlHelper.repositoryQuery(repositoryChunk))
            .then((response) => this.scrapeRateLimit(response))
            .then((response) => {
              each(
                repositoryChunk,
                (repository) => this.processRepositoryMetrics(repository, response),
              );
            })
            .catch((err) => {
              repositories.forEach(
                (repository) => this.metrics.githubRepoScrapedGauge.set({ repository }, 0),
              );

              console.error(`Failed to scrape details from repository ${repositories.join(', ')}:\n`, err.stack);
            });
        });
      },
      contributors: () => {
        each(repositories, this.scrapeRepositoryContributors);
      },
      traffic: () => {
        each(repositories, this.scrapeRepositoryTraffic);
      },
    });
  }

  processRepositoryMetrics(repository, metrics) {
    try {
      const repoLabel = `repo_${graphqlHelper.transformRepositoryNameToLabel(repository)}`;

      if (!(repoLabel in metrics)) {
        // noinspection ExceptionCaughtLocallyJS
        throw Error(`Can't find metrics for repository ${repository} in response.`);
      }

      const repositoryMetrics = metrics[repoLabel];
      const licence = repositoryMetrics.licenseInfo ? repositoryMetrics.licenseInfo.name : 'UNLICENSED';

      console.log(repositoryMetrics.packages);

      this.metrics.githubRepoInfoGauge.set({
        repository: repositoryMetrics.nameWithOwner,
        forked: String(repositoryMetrics.isFork),
        disabled: String(repositoryMetrics.isDisabled),
        archived: String(repositoryMetrics.isArchived),
        template: String(repositoryMetrics.isTemplate),
        owner: repositoryMetrics.owner.login,
        licence,
        created_at: repositoryMetrics.createdAt,
        updated_at: repositoryMetrics.updatedAt,
        language: repositoryMetrics.primaryLanguage.name,
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
        { repository }, repositoryMetrics.commits.history.totalCount,
      );
      this.metrics.githubRepoTagsGauge.set(
        { repository }, repositoryMetrics.tagsCount.totalCount,
      );
      this.metrics.githubRepoBranchesGauge.set(
        { repository }, repositoryMetrics.branchesTotalCount.totalCount,
      );
      this.metrics.githubRepoPackagesGauge.set(
        { repository }, repositoryMetrics.packages.TotalCount,
      );

      this.metrics.githubRepoScrapedGauge.set({ repository }, 1);
    } catch (err) {
      this.metrics.githubRepoScrapedGauge.set({ repository }, 0);

      console.error(`Failed to scrape details from repository ${repository}:\n`, err.stack);
    }
  }

  scrapeRepositoryRestDetails(repository) {
    this.metrics.githubRepoNetworkGauge.set(
      { repository }, repository.network_count,
    );
  }

  scrapeRepositoryTraffic(repository) {
    /*
    module.exports.scrapeRepository = async (metrics, octokit, organization) => {


    githubRepoClonesGauge
    githubRepoClonesUniqueGauge
    githubRepoContentViewsGauge
    githubRepoContentViewsUniqueGauge

    githubRepoDependenciesGauge
    githubRepoDependentsGauge
    githubRepoReferrerViewsGauge
    githubRepoReferrerViewsUniqueGauge
    githubRepoPopularContentViewsGauge
    githubRepoPopularContentViewsUniqueGauge
    };
    */
  }

  scrapeRepositoryContributors(repository) {
    const [owner, repo] = repository.split('/');

    const options = this.octokit.repos.listContributors.endpoint.merge({
      owner,
      repo,
    });

    this.octokit.paginate(
      options,
      (response) => {
        this.scrapeRateLimit(response);
        return response.data.map((collaborator) => collaborator);
      },
    )
      .then((repositoryContributors) => {
        this.metrics.githubRepoContributorsGauge.set({ repository },
          repositoryContributors.length);
      })
      .catch((err) => {
        console.error(`Failed to scrape contributors from repository ${repository}: `, err);
      });
  }
}

module.exports = Scraper;
