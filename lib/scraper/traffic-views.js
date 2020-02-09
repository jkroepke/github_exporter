const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')
const helpers = require('../helpers')

class TrafficTopReferrers {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoViewsGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_views',
        help: 'Total views from top 10 content for given repository',
        labelNames: ['owner', 'repository']
      }),
      githubRepoViewsUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_vistors',
        help: 'Total unique views from top 10 content for given repository',
        labelNames: ['owner', 'repository']
      })
    }
  }

  scrapeRepositories (repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')
      ghRestApi.repos.getViews({ owner, repo, per: 'day' })
        .then((response) => {
          const today = new Date()

          const todayMetric = response.data.views
            .filter((metric) => helpers.sameDay(today, new Date(metric.timestamp)))

          this.metrics.githubRepoViewsGauge.set(
            { owner, repository }, (todayMetric.length > 0) ? todayMetric[0].count : 0
          )
          this.metrics.githubRepoViewsUniqueGauge.set(
            { owner, repository }, (todayMetric.length > 0) ? todayMetric[0].uniques : 0
          )
        })
        .catch((err) => logger.error(`Failed to scrape view metrics for repository ${repository} via REST: ${err.message}`, err))
    })
  }
}

module.exports = TrafficTopReferrers
