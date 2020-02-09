// https://stackoverflow.com/a/37826698/8087167
const splitArray = (array, chunkSize) => array.reduce((all, one, i) => {
  const ch = Math.floor(i / chunkSize)

  // eslint-disable-next-line no-param-reassign
  all[ch] = [].concat((all[ch] || []), one)

  return all
}, [])

const transformRepositoryNameToGraphQlLabel = (name) => name.replace(/[-/.]/g, '_')

const generateGraphqlRepositoryQueries = (repositories) => repositories.map((repository) => {
  const [owner, name] = repository.split('/')
  const label = transformRepositoryNameToGraphQlLabel(repository)

  return `repo_${label}: repository(owner: "${owner}", name: "${name}") {\n...repositoryFragment\n}`
}).join('\n\n')

const sameDay = (d1, d2) => d1.getUTCFullYear() === d2.getUTCFullYear() &&
                            d1.getUTCMonth() === d2.getUTCMonth() &&
                            d1.getUTCDate() === d2.getUTCDate()

module.exports = {
  splitArray,
  transformRepositoryNameToGraphQlLabel,
  generateGraphqlRepositoryQueries,
  sameDay
}
