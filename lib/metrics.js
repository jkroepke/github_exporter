const Prometheus = require('prom-client');

module.exports = {
  Prometheus,
  githubRateLimitLimitGauge: new Prometheus.Gauge({
    name: 'github_rate_limit_limit',
    help: 'GitHub API rate limit limit',
    labelNames: ['api'],
  }),
  githubRateLimitRemainingGauge: new Prometheus.Gauge({
    name: 'github_rate_limit_remaining',
    help: 'GitHub API rate limit remaining',
    labelNames: ['api'],
  }),
  githubRateLimitResetGauge: new Prometheus.Gauge({
    name: 'github_rate_limit_reset',
    help: 'GitHub API rate limit reset',
    labelNames: ['api'],
  }),
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
  githubRepoNetworkGauge: new Prometheus.Gauge({
    name: 'github_repo_network_total',
    help: 'network size for given repository',
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
    labelNames: ['repository', 'url'],
  }),
  githubRepoReleasesGauge: new Prometheus.Gauge({
    name: 'github_repo_releases',
    help: 'Total number of releases for given repository',
    labelNames: ['repository'],
  }),
  githubRepoContributorsGauge: new Prometheus.Gauge({
    name: 'github_repo_contributors',
    help: 'Total number of releases for given repository',
    labelNames: ['repository'],
  }),
  githubRepoClonesGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_clones',
    help: 'Total number of clones for given repository',
    labelNames: ['repository'],
  }),
  githubRepoClonesUniqueGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_unique_clones',
    help: 'Total number of clones for given repository',
    labelNames: ['repository'],
  }),
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
  githubRepoDependenciesGauge: new Prometheus.Gauge({
    name: 'github_repo_dependencies',
    help: 'Dependencies for given repository',
    labelNames: ['repository', 'dependency'],
  }),
  githubRepoDependentsGauge: new Prometheus.Gauge({
    name: 'github_repo_dependents',
    help: 'Dependents for given repository',
    labelNames: ['repository', 'dependency'],
  }),
  githubRepoReferrerViewsGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_referring_sites_views',
    help: 'Total views from top 10 referrer for given repository',
    labelNames: ['repository', 'referrer'],
  }),
  githubRepoReferrerViewsUniqueGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_referring_sites_unique_vistors',
    help: 'Total unique visitors from top 10 referrers for given repository',
    labelNames: ['repository', 'referrer'],
  }),
  githubRepoPopularContentViewsGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_popular_content_views',
    help: 'Total views from top 10 content for given repository',
    labelNames: ['repository', 'path'],
  }),
  githubRepoPopularContentViewsUniqueGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_popular_content_unique_vistors',
    help: 'Total unique views from top 10 content for given repository',
    labelNames: ['repository', 'path'],
  }),
};
