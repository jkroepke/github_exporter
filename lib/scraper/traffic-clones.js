const Prometheus = require('prom-client')
const ghRestApi = require('../github/rest')
const logger = require('../logger')
const helpers = require('../helpers')

class TrafficClones {
  constructor () {
    this.registerMetrics()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoClonesGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository']
      }),
      githubRepoClonesUniqueGauge: new Prometheus.Gauge({
        name: 'github_repo_traffic_unique_clones',
        help: 'Total number of clones for given repository',
        labelNames: ['owner', 'repository']
      })
    }
  }

  scrapeRepositories (repositories) {
    repositories.forEach((repository) => {
      const [owner, repo] = repository.split('/')

      ghRestApi.repos.getClones({ owner, repo, per: 'day' })
        .then((response) => {
          const today = new Date()

          const todayMetric = response.data.clones
            .filter((metric) => helpers.sameDay(today, new Date(metric.timestamp)))

          this.metrics.githubRepoClonesGauge.set(
            { owner, repository }, (todayMetric.length > 0) ? todayMetric[0].count : 0
          )
          this.metrics.githubRepoClonesUniqueGauge.set(
            { owner, repository }, (todayMetric.length > 0) ? todayMetric[0].uniques : 0
          )
        })
        .catch((err) => logger.error(`Failed to scrape clone metrics for repository ${repository} via REST: ${err.message}`, err))
    })
  }
}

module.exports = TrafficClones
