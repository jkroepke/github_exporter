const { graphql } = require('@octokit/graphql');

const { version } = require('../../package.json');
const { argv } = require('../args');

const defaults = {
  headers: {
    'user-agent': `jkroepke/github_exporter v${version}`,
  },
  mediaType: {
    previews: [
      'packages',
      'hawkgirl', // Repositories Dependency Graph
    ],
  },
};

if (argv.token) {
  defaults.headers.authorization = `token ${argv.token}`;
}

module.exports = graphql.defaults(defaults);
