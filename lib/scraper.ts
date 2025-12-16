import logger from "./logger.js";
import { argv } from "./args.js";
import ghRestApi from "./github/rest.js";

interface ScraperModule {
  scrapeGlobal?: () => void | Promise<void>;
  scrapeRepositories?: (repositories: string[]) => void;
}

// Load scraper modules dynamically
const loadScraperModules = async (): Promise<ScraperModule[]> => {
  return Promise.all(
    argv.scraper.map(async (scraperModule) => {
      const module = await import(`./scraper/${scraperModule}.js`);
      return new module.default();
    }),
  );
};

let scraperModules: ScraperModule[] = [];
let globalScraperModules: ScraperModule[] = [];
let repositoryScraperModules: ScraperModule[] = [];

// Initialize modules
export const initializeScrapers = async (): Promise<void> => {
  scraperModules = await loadScraperModules();

  globalScraperModules = scraperModules.filter(
    (module) => typeof module.scrapeGlobal === "function",
  );

  repositoryScraperModules = scraperModules.filter(
    (module) => typeof module.scrapeRepositories === "function",
  );
};

const scrapeRepositories = (repositories: string[]): void => {
  repositoryScraperModules.forEach((scraper) => {
    scraper.scrapeRepositories!(repositories);
  });
};

export const initScrapeGlobal = (interval: number, spread: boolean): void => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    globalScraperModules.forEach((scraper) => {
      const result = scraper.scrapeGlobal!();
      // Handle both sync and async scrapeGlobal methods
      if (result instanceof Promise) {
        void result;
      }
    });
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};

export const initScrapeOrganization = (
  organization: string,
  interval: number,
  spread: boolean,
): void => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = async () => {
    try {
      const options = ghRestApi.repos.listForOrg.endpoint.merge({
        org: organization,
      });

      const repositories = await ghRestApi.paginate<any>(options, (response: any) =>
        response.data.map((repository: any) => repository.full_name),
      );

      scrapeRepositories(repositories as string[]);
    } catch (err) {
      logger.error(
        `Failed to get all repository from organization ${organization} via REST: `,
        (err as Error).message,
      );
    }
  };

  setTimeout(() => {
    void scrapeHandler();
    setInterval(() => void scrapeHandler(), interval);
  }, startScrape);
};

export const initScrapeUser = (username: string, interval: number, spread: boolean): void => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = async () => {
    try {
      const options = ghRestApi.repos.listForUser.endpoint.merge({
        username,
        type: "owner",
      });

      const repositories = await ghRestApi.paginate<any>(options, (response: any) =>
        response.data.map((repository: any) => repository.full_name),
      );

      scrapeRepositories(repositories as string[]);
    } catch (err) {
      logger.error(
        `Failed to get all repository from user ${username} via REST: `,
        (err as Error).message,
      );
    }
  };

  setTimeout(() => {
    void scrapeHandler();
    setInterval(() => void scrapeHandler(), interval);
  }, startScrape);
};

export const initScrapeRepositories = (
  repositories: string[],
  interval: number,
  spread: boolean,
): void => {
  const startScrape = spread ? Math.round(interval * Math.random()) : 0;

  const scrapeHandler = () => {
    scrapeRepositories(repositories);
  };

  setTimeout(() => {
    scrapeHandler();
    setInterval(scrapeHandler, interval);
  }, startScrape);
};
