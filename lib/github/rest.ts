import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";
import { createActionAuth } from "@octokit/auth-action";
import { createOAuthAppAuth } from "@octokit/auth-oauth-app";
import { createAppAuth } from "@octokit/auth-app";

import packageJson from "../../package.json" with { type: "json" };
import { argv } from "../args.js";
import logger from "../logger.js";

const options: any = {
  auth: argv.auth,
  userAgent: `github_exporter/${packageJson.version} (jkroepke/github_exporter; +https://github.com/jkroepke/github_exporter)`,
  log: {
    debug: (message: string) => logger.debug(message),
    info: (message: string) => logger.verbose(message),
    warn: (message: string) => logger.warn(message),
    error: (message: string) => logger.error(message),
  },
  throttle: {
    onRateLimit: (_retryAfter: number, options: any, octokit: any, retryCount: number) => {
      octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

      if (retryCount < 1) {
        // only retries once
        octokit.log.info(`Retrying after ${_retryAfter} seconds!`);
        return true;
      }
      return false;
    },
    onSecondaryRateLimit: (_retryAfter: number, options: any, octokit: any) => {
      // does not retry, only logs a warning
      octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
    },
  },
};

switch (argv.authStrategy) {
  case "action": {
    options.authStrategy = createActionAuth;
    break;
  }
  case "oauth-app": {
    options.authStrategy = createOAuthAppAuth;
    break;
  }
  case "app": {
    options.authStrategy = createAppAuth;
    break;
  }
  case "token":
  default:
    break;
}

const octokit: Octokit = new (Octokit.plugin(throttling))(options);

export default octokit;
