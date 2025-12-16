// https://stackoverflow.com/a/37826698/8087167
export const splitArray = <T>(array: T[], chunkSize: number): T[][] =>
  array.reduce<T[][]>((all, one, i) => {
    const ch = Math.floor(i / chunkSize);

    // eslint-disable-next-line no-param-reassign
    all[ch] = (all[ch] || []).concat(one);

    return all;
  }, []);

export const transformRepositoryNameToGraphQlLabel = (name: string): string =>
  name.replace(/[-/.]/g, "_");

export const generateGraphqlRepositoryQueries = (repositories: string[]): string =>
  repositories
    .map((repository) => {
      const [owner, name] = repository.split("/");
      const label = transformRepositoryNameToGraphQlLabel(repository);

      return `repo_${label}: repository(owner: "${owner}", name: "${name}") {\n...repositoryFragment\n}`;
    })
    .join("\n\n");

export const getWeekNumber = (date: Date): number => {
  // https://stackoverflow.com/a/6117889/8087167
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
