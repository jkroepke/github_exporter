// https://stackoverflow.com/a/37826698/8087167
const splitArray = (array, chunkSize) =>
  array.reduce((all, one, i) => {
    const ch = Math.floor(i / chunkSize)

    // eslint-disable-next-line no-param-reassign
    all[ch] = [].concat(all[ch] || [], one)

    return all
  }, [])

const transformRepositoryNameToGraphQlLabel = (name) => name.replace(/[-/.]/g, '_')

const generateGraphqlRepositoryQueries = (repositories) =>
  repositories
    .map((repository) => {
      const [owner, name] = repository.split('/')
      const label = transformRepositoryNameToGraphQlLabel(repository)

      return `repo_${label}: repository(owner: "${owner}", name: "${name}") {\n...repositoryFragment\n}`
    })
    .join('\n\n')

const getWeekNumber = (date) => {
  // https://stackoverflow.com/a/6117889/8087167
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))

  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

module.exports = {
  splitArray,
  transformRepositoryNameToGraphQlLabel,
  generateGraphqlRepositoryQueries,
  getWeekNumber
}
