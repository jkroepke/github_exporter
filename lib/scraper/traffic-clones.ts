import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";
import * as helpers from "../helpers.js";

interface CloneMetric {
  timestamp: string;
  count: number;
  uniques: number;
}

class TrafficClones {
  private metrics!: {
    githubRepoClonesGauge: Prometheus.Gauge<string>;
    githubRepoClonesUniqueGauge: Prometheus.Gauge<string>;
    githubRepoClonesAvgGauge: Prometheus.Gauge<string>;
    githubRepoClonesUniqueAvgGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoClonesGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_clones",
        help: "Total number of clones for given repository",
        labelNames: ["owner", "repository", "week"],
      }),
      githubRepoClonesUniqueGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_unique_clones",
        help: "Total number of clones for given repository",
        labelNames: ["owner", "repository", "week"],
      }),
      githubRepoClonesAvgGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_clones_avg",
        help: "Avenge number of clones for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoClonesUniqueAvgGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_unique_clones_avg",
        help: "Avenge number of clones for given repository",
        labelNames: ["owner", "repository"],
      }),
    };
  }

  async scrapeRepository(repository: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");

      const response = await ghRestApi.repos.getClones({ owner, repo, per: "week" as any });

      this.metrics.githubRepoClonesAvgGauge.set({ owner, repository }, response.data.count);
      this.metrics.githubRepoClonesUniqueAvgGauge.set({ owner, repository }, response.data.uniques);

      const currentWeekNumber = helpers.getWeekNumber(new Date());

      const currentWeek = response.data.clones.filter(
        (metric: CloneMetric) =>
          currentWeekNumber === helpers.getWeekNumber(new Date(metric.timestamp)),
      );

      this.metrics.githubRepoClonesGauge.set(
        { owner, repository, week: "latest" },
        currentWeek.length > 0 ? currentWeek[0].count : 0,
      );
      this.metrics.githubRepoClonesUniqueGauge.set(
        { owner, repository, week: "latest" },
        currentWeek.length > 0 ? currentWeek[0].uniques : 0,
      );

      response.data.clones
        .filter(
          (metric: CloneMetric) =>
            currentWeekNumber !== helpers.getWeekNumber(new Date(metric.timestamp)),
        )
        .forEach((metric: CloneMetric) => {
          const weekNumber = helpers.getWeekNumber(new Date(metric.timestamp));
          this.metrics.githubRepoClonesGauge.set(
            { owner, repository, week: weekNumber.toString() },
            metric.count,
          );
          this.metrics.githubRepoClonesUniqueGauge.set(
            { owner, repository, week: weekNumber.toString() },
            metric.uniques,
          );
        });
    } catch (err) {
      logger.error(
        `Failed to scrape clone metrics for repository ${repository} via REST: ${(err as Error).message}`,
        err,
      );
    }
  }

  scrapeRepositories(repositories: string[]): void {
    repositories.forEach((repository) => {
      void this.scrapeRepository(repository);
    });
  }
}

export default TrafficClones;
