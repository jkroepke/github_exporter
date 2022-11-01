const Prometheus = require('prom-client')
const fs = require('fs')
const graphql = require('../github/graphql')
const logger = require('../logger')
const helpers = require('../helpers')

const maxRepositoriesPerScrape = 100

class Status {
  constructor () {
    this.registerMetrics()
    this.loadQueryTemplate()
  }

  registerMetrics () {
    this.metrics = {
      githubRepoCollaboratorGauge: new Prometheus.Gauge({
        name: 'github_repo_collaborator_total',
        help: 'total amount of collaborators for given repository',
        labelNames: ['owner', 'repository', 'affiliation']
      })
    }
  }

  loadQueryTemplate () {
    this.graphqlQuery = fs.readFileSync('./templates/graphql/collaborators.graphql', 'utf8')
  }

  scrapeRepositories (repositories) {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape)

    repositoryChunks.forEach((repositoryChunk) => {
      graphql(this.getQuery(repositoryChunk))
        .then((response) => {
          repositoryChunk.forEach((repository) => {
            const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`

            if (!(repoLabel in response)) {
              logger.error(`Can't find metrics for repository ${repository} in response.`)
            }

            this.process(repository, response[repoLabel])
          })
        })
        .catch((err) => {
          logger.error(
            `Failed to get collaborators from repository ${repositories.join(', ')}: `,
            err
          )
        })
    })
  }

  process (repository, repositoryMetrics) {
    const [owner] = repository.split('/')

    this.metrics.githubRepoCollaboratorGauge.set({ owner, repository, affiliation: 'direct' }, repositoryMetrics.collaboratorsDirect.totalCount)
    this.metrics.githubRepoCollaboratorGauge.set({ owner, repository, affiliation: 'outside' }, repositoryMetrics.collaboratorsOutside.totalCount)
  }

  getQuery (repositories) {
    return [
      this.graphqlQuery,
      '{',
      helpers.generateGraphqlRepositoryQueries(repositories),
      '}'
    ].join('\n')
  }
}

module.exports = Status
