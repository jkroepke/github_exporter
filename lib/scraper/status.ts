import * as Prometheus from "prom-client";
import fs from "fs";
import ghRestApi from "../github/rest.js";
import graphql from "../github/graphql.js";
import logger from "../logger.js";
import * as helpers from "../helpers.js";

const maxRepositoriesPerScrape = 100;

class Status {
  private metrics!: {
    githubRepoStatusGauge: Prometheus.Gauge<string>;
  };
  private graphqlQuery!: string;

  constructor() {
    this.registerMetrics();
    this.loadQueryTemplate();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoStatusGauge: new Prometheus.Gauge({
        name: "github_repo_status",
        help: "status for the default branch for given repository",
        labelNames: ["owner", "repository", "context"],
      }),
    };
  }

  loadQueryTemplate(): void {
    this.graphqlQuery = fs.readFileSync("./templates/graphql/default-ref.graphql", "utf8");
  }

  async scrapeRepositoryChunk(repositoryChunk: string[]): Promise<void> {
    try {
      const response: any = await graphql(this.getQuery(repositoryChunk));

      repositoryChunk.forEach((repository) => {
        const repoLabel = `repo_${helpers.transformRepositoryNameToGraphQlLabel(repository)}`;

        if (!(repoLabel in response)) {
          logger.error(`Can't find metrics for repository ${repository} in response.`);
          return;
        }

        if (response[repoLabel].defaultBranchRef === null) return;

        void this.scrapeStatus(repository, response[repoLabel].defaultBranchRef.name);
      });
    } catch (err) {
      logger.error(`Failed get status from repository ${repositoryChunk.join(", ")}: `, err);
    }
  }

  scrapeRepositories(repositories: string[]): void {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      void this.scrapeRepositoryChunk(repositoryChunk);
    });
  }

  async scrapeStatus(repository: string, defaultBranch: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");

      const response = await ghRestApi.repos.getCombinedStatusForRef({
        owner,
        repo,
        ref: defaultBranch,
      });

      this.metrics.githubRepoStatusGauge.reset();

      response.data.statuses.forEach((status) => {
        this.metrics.githubRepoStatusGauge.set(
          { owner, repository, context: status.context },
          Status.stateToMetric(status.state),
        );
      });
    } catch (err) {
      logger.error(
        `Failed to scrape status from repository ${repository} via REST: ${(err as Error).message}`,
        err,
      );
    }
  }

  static stateToMetric(state: string): number {
    const map: Record<string, number> = {
      success: 0,
      error: 1,
      failure: 2,
      pending: 3,
    };

    if (state in map) {
      return map[state];
    }

    return -1;
  }

  getQuery(repositories: string[]): string {
    return [
      this.graphqlQuery,
      "{",
      helpers.generateGraphqlRepositoryQueries(repositories),
      "}",
    ].join("\n");
  }
}

export default Status;
