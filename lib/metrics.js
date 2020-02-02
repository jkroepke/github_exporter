const Prometheus = require('prom-client');

module.exports = {
  githubRepoIssuesGauge: new Prometheus.Gauge({
    name: 'github_repo_issue',
    help: 'Issues for given repository',
    labelNames: ['repository', 'status'],
  }),
  githubRepoPullRequestsGauge: new Prometheus.Gauge({
    name: 'github_repo_pull_request',
    help: 'Pull requests for given repository',
    labelNames: ['repository', 'status'],
  }),
  githubRepoWatchersGauge: new Prometheus.Gauge({
    name: 'github_repo_watchers',
    help: 'Total number of watchers/subscribers for given repository',
    labelNames: ['repository'],
  }),
  githubRepoStarsGauge: new Prometheus.Gauge({
    name: 'github_repo_stars',
    help: 'Total number of Stars for given repository',
    labelNames: ['repository'],
  }),
  githubRepoForksGauge: new Prometheus.Gauge({
    name: 'github_repo_forks',
    help: 'Total number of forks for given repository',
    labelNames: ['repository'],
  }),
  githubRepoCommitsGauge: new Prometheus.Gauge({
    name: 'github_repo_commits',
    help: 'Total number of commits for given repository',
    labelNames: ['repository'],
  }),
  githubRepoBranchesGauge: new Prometheus.Gauge({
    name: 'github_repo_branches',
    help: 'Total number of branches for given repository',
    labelNames: ['repository'],
  }),
  githubRepoPackagesGauge: new Prometheus.Gauge({
    name: 'github_repo_packages',
    help: 'Total number of packages for given repository',
    labelNames: ['repository'],
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
  githubRepoContentViewsGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_views',
    help: 'Total views from top 10 content for given repository',
    labelNames: ['repository', 'path'],
  }),
  githubRepoContentViewsUniqueGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_unique_vistors',
    help: 'Total unique views from top 10 content for given repository',
    labelNames: ['repository', 'path'],
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
    help: 'Total content views from top 10 referrer for given repository',
    labelNames: ['repository', 'content'],
  }),
  githubRepoPopularContentViewsUniqueGauge: new Prometheus.Gauge({
    name: 'github_repo_traffic_popular_content_unique_vistors',
    help: 'Total content unique visitors from top 10 referrers for given repository',
    labelNames: ['repository', 'content'],
  }),
};
