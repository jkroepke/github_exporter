import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";

class Contributors {
  private metrics!: {
    githubRepoContributorsGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoContributorsGauge: new Prometheus.Gauge({
        name: "github_repo_contributors",
        help: "Total number of releases for given repository",
        labelNames: ["owner", "repository"],
      }),
    };
  }

  async scrapeRepository(repository: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");

      const options = ghRestApi.repos.listContributors.endpoint.merge({ owner, repo });

      // data is null if repository is empty
      const repositoryContributors = await ghRestApi.paginate(options, (response: any) =>
        (response.data || []).map((collaborator: any) => collaborator),
      );

      this.metrics.githubRepoContributorsGauge.set(
        { owner, repository },
        repositoryContributors.length,
      );
    } catch (err) {
      logger.error(
        `Failed to scrape contributors from repository ${repository} via REST: ${(err as Error).message}`,
        err,
      );
    }
  }

  scrapeRepositories(repositories: string[]): void {
    repositories.forEach((repository) => {
      void this.scrapeRepository(repository);
    });
  }

  async scrapeRepositoriesAsync(repositories: string[]): Promise<void> {
    await Promise.all(repositories.map((repository) => this.scrapeRepository(repository)));
  }
}

export default Contributors;
