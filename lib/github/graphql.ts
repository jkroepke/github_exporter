import { graphql } from "@octokit/graphql";
import { createActionAuth } from "@octokit/auth-action";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { createAppAuth } from "@octokit/auth-app";

import packageJson from "../../package.json" with { type: "json" };
import { argv } from "../args.js";

const defaults: any = {
  headers: {
    "user-agent": `jkroepke/github_exporter v${packageJson.version}`,
  },
  mediaType: {
    previews: [
      "packages",
      "hawkgirl", // Dependency Graph GraphQL API
      "vixen", // Repository Vulnerability Alerts GraphQL API
    ],
  },
  request: {},
};

switch (argv.authStrategy) {
  case "action": {
    defaults.request.hook = createActionAuth();
    break;
  }
  case "oauth-app": {
    defaults.request.hook = createOAuthAppAuth(argv.auth as any);
    break;
  }
  case "app": {
    defaults.request.hook = createAppAuth(argv.auth as any);
    break;
  }
  case "token": {
    defaults.headers.authorization = `token ${argv.auth}`;
    break;
  }
  default:
    break;
}

export default graphql.defaults(defaults);
