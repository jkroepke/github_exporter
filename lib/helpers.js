// https://stackoverflow.com/a/37826698/8087167
const splitArray = (array, chunkSize) => array.reduce((all, one, i) => {
  const ch = Math.floor(i / chunkSize);

  // eslint-disable-next-line no-param-reassign
  all[ch] = [].concat((all[ch] || []), one);

  return all;
}, []);

const transformRepositoryNameToGraphQlLabel = (name) => name.replace(/[-/.]/g, '_');

const generateGraphqlRepositoryQueries = (repositories) => repositories.map((repository) => {
  const [owner, name] = repository.split('/');
  const label = transformRepositoryNameToGraphQlLabel(repository);

  return `repo_${label}: repository(owner: "${owner}", name: "${name}") {\n...repositoryFragment\n}`;
}).join('\n\n');

module.exports = {
  splitArray,
  transformRepositoryNameToGraphQlLabel,
  generateGraphqlRepositoryQueries,
};
