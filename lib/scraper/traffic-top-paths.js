const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')

class TrafficTopPaths {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoPopularContentViewsGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_popular_content_views',
        help: 'Total views from top 10 content for given repository',
        labelNames: ['owner', 'repository', 'path']
      }),
      githubRepoPopularContentViewsUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_popular_content_unique_vistors',
        help: 'Total unique views from top 10 content for given repository',
        labelNames: ['owner', 'repository', 'path']
      })
    }
  }

  scrapeRepositories (repositories) {
    this.metrics.githubRepoPopularContentViewsGauge.reset()
    this.metrics.githubRepoPopularContentViewsUniqueGauge.reset()
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')
      ghRestApi.repos
        .getTopPaths({ owner, repo })
        .then((response) => {
          response.data.forEach((path) => {
            this.metrics.githubRepoPopularContentViewsGauge.set(
              { owner, repository, path: path.path },
              path.count
            )
            this.metrics.githubRepoPopularContentViewsUniqueGauge.set(
              { owner, repository, path: path.path },
              path.uniques
            )
          })
        })
        .catch((err) =>
          logger.error(
            `Failed to scrape path metrics for repository ${repository} via REST: ${err.message}`,
            err
          )
        )
    })
  }
}

module.exports = TrafficTopPaths
