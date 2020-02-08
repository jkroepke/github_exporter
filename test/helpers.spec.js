const assert = require('assert')
const helpers = require('../lib/helpers')

describe('helpers', function () {
  describe('#splitArray()', function () {
    it('splitt array into chunks', function () {
      assert.deepStrictEqual(helpers.splitArray([1, 2, 3], 2), [[1, 2], [3]])
    })
  })

  describe('#transformRepositoryNameToGraphQlLabel()', function () {
    it('transform repo', function () {
      assert.strictEqual(helpers.transformRepositoryNameToGraphQlLabel('owner/repo'), 'owner_repo')
    })

    it('transform hypen', function () {
      assert.strictEqual(helpers.transformRepositoryNameToGraphQlLabel('owner/re-po'), 'owner_re_po')
    })

    it('transform dots', function () {
      assert.strictEqual(helpers.transformRepositoryNameToGraphQlLabel('owner/re.po'), 'owner_re_po')
    })
  })

  describe('#generateGraphqlRepositoryQueries()', function () {
    it('generate query', function () {
      assert.strictEqual(
        helpers.generateGraphqlRepositoryQueries(['owner/repo']),
        'repo_owner_repo: repository(owner: "owner", name: "repo") {\n' +
        '...repositoryFragment\n' +
        '}'
      )
    })

    it('generate query for multiple repositories', function () {
      assert.strictEqual(
        helpers.generateGraphqlRepositoryQueries(['owner/repo', 'owner/repo2']),
        'repo_owner_repo: repository(owner: "owner", name: "repo") {\n' +
        '...repositoryFragment\n' +
        '}\n' +
        '\n' +
        'repo_owner_repo2: repository(owner: "owner", name: "repo2") {\n' +
        '...repositoryFragment\n' +
        '}'
      )
    })
  })
})
