const commaListToArray = (opt) => opt.map((element) => element.split(',')).flat();

module.exports.argv = require('yargs')
  .usage('$0 -t <token> -i 600 [ -s ] [ -l :: ] [ -p 9171 ] [ -o organization ] [ -r owner/repository ]')
  .option('token', {
    alias: 't',
    describe: 'GitHub Personal access token',
    demandOption: true,
    nargs: 1,
  })
  .option('interval', {
    alias: 'i',
    describe: 'scrape interval',
    group: 'Scape settings:',
    number: true,
    default: 300,
  })
  .option('spread', {
    alias: 's',
    describe: 'spread request over interval',
    group: 'Scape settings:',
    boolean: true,
    default: false,
  })
  .option('organization', {
    alias: 'o',
    describe: 'GitHub organization to scrape. Can be defined multiple times or comma separated list',
    group: 'Scape targets:',
    array: true,
    default: [],
    coerce: commaListToArray,
  })
  .option('repository', {
    alias: 'r',
    describe: 'GitHub repositories to scrape. Can be defined multiple times or comma separated list. Format: <owner>/<repo>',
    group: 'Scape targets:',
    array: true,
    default: [],
    coerce: commaListToArray,
  })
  .option('listen', {
    alias: 'l',
    describe: 'address to bind exporter',
    default: '::',
    group: 'Bind options:',
  })
  .option('port', {
    alias: 'p',
    describe: 'port to bind exporter',
    default: 9171,
    group: 'Bind options:',
    number: true,
  })
  .env('GITHUB_EXPORTER')
  .help('help')
  .alias('help', 'h')
  .epilogue('for more information, find our manual at https://github.com/jkroepke/github_exporter')
  .wrap(null)
  .argv;
