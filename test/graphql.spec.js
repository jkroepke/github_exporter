const assert = require('assert');
const graphqlHelper = require('../lib/graphql');

describe('graphqlHelper', function () {
  describe('transformRepositoryNameToLabel', function () {
    it('owner/re.po should transform to owner_re_po', function () {
      assert.equal(graphqlHelper.transformRepositoryNameToLabel('owner/re.po'), 'owner_re_po');
    });
  });

  describe('repositoryQuery', function () {
    it('shoud contain owner/re.po', function () {
      const query = graphqlHelper.repositoryQuery(Array('owner/re.po'));

      assert.ok(query.match(/owner_re_po:/));
      assert.ok(query.match(/owner: "owner"/));
      assert.ok(query.match(/name: "re.po"/));
    });
  });
});
