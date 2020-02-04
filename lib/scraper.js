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
    this.scrapeRepositoriesGraphQlDetails(repositories);

    repositories.forEach((repository) => {
      this.scrapeRepositoryRestDetails(repository);
      this.scrapeRepositoryContributors(repository);
      this.scrapeRepositoryTraffic(repository);
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
      const language = repositoryMetrics.primaryLanguage ? repositoryMetrics.primaryLanguage.name : 'UNKNOWN';

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
        { repository }, repositoryMetrics.commits.history.totalCount,
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
      this.metrics.githubRepoDependentsGauge.set(
        { repository }, repositoryMetrics.dependencyGraphManifests.totalCount,
      );

      this.metrics.githubRepoScrapedGauge.set({ repository }, 1);
    } catch (err) {
      this.metrics.githubRepoScrapedGauge.set({ repository }, 0);

      console.error(`Failed to scrape details from repository ${repository}:\n`, err.stack);
    }
  }

  scrapeRepositoriesGraphQlDetails(repositories) {
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
          repositoryChunk.forEach(
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
  }

  scrapeRepositoryRestDetails(repository) {
    const [owner, repo] = repository.split('/');

    this.octokit.repos.get({
      owner,
      repo,
    })
      .then((response) => this.scrapeRateLimit(response))
      .then((response) => {
        this.metrics.githubRepoNetworkGauge.set(
          { repository }, response.data.network_count,
        );
      })
      .catch((err) => {
        console.error(`Failed to scrape repository ${repository} via REST: `, err);
      });
  }

  scrapeRepositoryTraffic(repository) {
    const [owner, repo] = repository.split('/');

    this.octokit.repos.getClones({
      owner,
      repo,
      per: 'day',
    })
      .then((response) => this.scrapeRateLimit(response))
      .then((response) => {
        response.data.clones.forEach((cloneMetric) => {
          this.metrics.githubRepoClonesGauge.set(
            { repository }, cloneMetric.count, Date.parse(cloneMetric.timestamp),
          );
          this.metrics.githubRepoClonesUniqueGauge.set(
            { repository }, cloneMetric.uniques, Date.parse(cloneMetric.timestamp),
          );
        });
      })
      .catch((err) => {
        console.error(`Failed to scrape clone metrics for repository ${repository} via REST: `, err);
      });

    this.octokit.repos.getTopPaths({
      owner,
      repo,
    })
      .then((response) => this.scrapeRateLimit(response))
      .then((response) => {
        response.data.forEach((path) => {
          this.metrics.githubRepoPopularContentViewsGauge.set(
            { repository, path: path.path }, path.count,
          );
          this.metrics.githubRepoPopularContentViewsUniqueGauge.set(
            { repository, path: path.path }, path.uniques,
          );
        });
      })
      .catch((err) => {
        console.error(`Failed to scrape path metrics for repository ${repository} via REST: `, err);
      });

    this.octokit.repos.getTopReferrers({
      owner,
      repo,
    })
      .then((response) => this.scrapeRateLimit(response))
      .then((response) => {
        response.data.forEach((referrer) => {
          this.metrics.githubRepoReferrerViewsGauge.set(
            { repository, referrer: referrer.referrer }, referrer.count,
          );
          this.metrics.githubRepoReferrerViewsUniqueGauge.set(
            { repository, referrer: referrer.referrer }, referrer.uniques,
          );
        });
      })
      .catch((err) => {
        console.error(`Failed to scrape referrer metrics for repository ${repository} via REST: `, err);
      });

    this.octokit.repos.getViews({
      owner,
      repo,
    })
      .then((response) => this.scrapeRateLimit(response))
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
      .catch((err) => {
        console.error(`Failed to scrape view metrics for repository ${repository} via REST: `, err);
      });
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

        // data is null if repository is empty
        return (response.data || []).map((collaborator) => collaborator);
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
