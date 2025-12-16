import * as Prometheus from "prom-client";
import ghRestApi from "../github/rest.js";
import logger from "../logger.js";
import * as helpers from "../helpers.js";

interface ViewMetric {
  timestamp: string;
  count: number;
  uniques: number;
}

class TrafficViews {
  private metrics!: {
    githubRepoViewsGauge: Prometheus.Gauge<string>;
    githubRepoViewsUniqueGauge: Prometheus.Gauge<string>;
    githubRepoViewsAvgGauge: Prometheus.Gauge<string>;
    githubRepoViewsUniqueAvgGauge: Prometheus.Gauge<string>;
  };

  constructor() {
    this.registerMetrics();
  }

  registerMetrics(): void {
    this.metrics = {
      githubRepoViewsGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_views",
        help: "Total views from top 10 content for given repository",
        labelNames: ["owner", "repository", "week"],
      }),
      githubRepoViewsUniqueGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_unique_vistors",
        help: "Total unique views from top 10 content for given repository",
        labelNames: ["owner", "repository", "week"],
      }),
      githubRepoViewsAvgGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_views_avg",
        help: "Avenge views from top 10 content for given repository",
        labelNames: ["owner", "repository"],
      }),
      githubRepoViewsUniqueAvgGauge: new Prometheus.Gauge({
        name: "github_repo_traffic_unique_vistors_avg",
        help: "Avenge unique views from top 10 content for given repository",
        labelNames: ["owner", "repository"],
      }),
    };
  }

  async scrapeRepository(repository: string): Promise<void> {
    try {
      const [owner, repo] = repository.split("/");
      const response = await ghRestApi.repos.getViews({ owner, repo, per: "week" as any });

      this.metrics.githubRepoViewsAvgGauge.set({ owner, repository }, response.data.count);
      this.metrics.githubRepoViewsUniqueAvgGauge.set({ owner, repository }, response.data.uniques);

      const currentWeekNumber = helpers.getWeekNumber(new Date());

      const currentWeek = response.data.views.filter(
        (metric: ViewMetric) =>
          currentWeekNumber === helpers.getWeekNumber(new Date(metric.timestamp)),
      );

      this.metrics.githubRepoViewsGauge.set(
        { owner, repository, week: "latest" },
        currentWeek.length > 0 ? currentWeek[0].count : 0,
      );
      this.metrics.githubRepoViewsUniqueGauge.set(
        { owner, repository, week: "latest" },
        currentWeek.length > 0 ? currentWeek[0].uniques : 0,
      );

      response.data.views
        .filter(
          (metric: ViewMetric) =>
            currentWeekNumber !== helpers.getWeekNumber(new Date(metric.timestamp)),
        )
        .forEach((metric: ViewMetric) => {
          const weekNumber = helpers.getWeekNumber(new Date(metric.timestamp));
          this.metrics.githubRepoViewsGauge.set(
            { owner, repository, week: weekNumber.toString() },
            metric.count,
          );
          this.metrics.githubRepoViewsUniqueGauge.set(
            { owner, repository, week: weekNumber.toString() },
            metric.uniques,
          );
        });
    } catch (err) {
      logger.error(
        `Failed to scrape view metrics for repository ${repository} via REST: ${(err as Error).message}`,
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

export default TrafficViews;
