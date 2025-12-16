import * as Prometheus from "prom-client";
import fs from "fs";
import graphql from "../github/graphql.js";
import logger from "../logger.js";
import * as helpers from "../helpers.js";

const maxRepositoriesPerScrape = 100;

interface RepositoryMetrics {
  collaboratorsDirect: { totalCount: number };
  collaboratorsOutside: { totalCount: number };
}

class Collaborators {
  private metrics!: {
    githubRepoCollaboratorGauge: Prometheus.Gauge<string>;
  };
  private graphqlQuery!: string;

  constructor() {
    this.registerMetrics();
    this.loadQueryTemplate();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoCollaboratorGauge: new Prometheus.Gauge({
        name: "github_repo_collaborator_total",
        help: "total amount of collaborators for given repository",
        labelNames: ["owner", "repository", "affiliation"],
      }),
    };
  }

  loadQueryTemplate(): void {
    this.graphqlQuery = fs.readFileSync("./templates/graphql/collaborators.graphql", "utf8");
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

        this.process(repository, response[repoLabel]);
      });
    } catch (err) {
      logger.error(
        `Failed to get collaborators from repository ${repositoryChunk.join(", ")}: `,
        err,
      );
    }
  }

  scrapeRepositories(repositories: string[]): void {
    const repositoryChunks = helpers.splitArray(repositories, maxRepositoriesPerScrape);

    repositoryChunks.forEach((repositoryChunk) => {
      void this.scrapeRepositoryChunk(repositoryChunk);
    });
  }

  process(repository: string, repositoryMetrics: RepositoryMetrics): void {
    const [owner] = repository.split("/");

    this.metrics.githubRepoCollaboratorGauge.set(
      { owner, repository, affiliation: "direct" },
      repositoryMetrics.collaboratorsDirect.totalCount,
    );
    this.metrics.githubRepoCollaboratorGauge.set(
      { owner, repository, affiliation: "outside" },
      repositoryMetrics.collaboratorsOutside.totalCount,
    );
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

export default Collaborators;
