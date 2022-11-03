const fs = require('fs')
const winston = require('winston')

const commaListToArray = (opt) => opt.map((element) => element.split(',')).flat()

module.exports.argv = require('yargs')
  .usage(
    '$0 -t <token> -i 600 [ -s ] [ -l :: ] [ -p 9171 ] [ -o organization ] [ -u user ] [ -r owner/repository ]'
  )
  .config('config', (cfgPath) => JSON.parse(fs.readFileSync(cfgPath, 'utf8')))

  .option('auth-strategy', {
    describe: 'GitHub auth strategy',
    demandOption: true,
    nargs: 1,
    group: 'Authentication:',
    default: 'token',
    choices: ['token', 'oauth-app', 'app', 'action']
  })
  .option('auth', {
    alias: 'a',
    conflicts: 'token',
    describe: 'GitHub auth data (e.g.: token)',
    demandOption: true,
    group: 'Authentication:',
    nargs: 1,
    coerce: function (arg) {
      return arg.startsWith('{') ? JSON.parse(arg) : arg
    }
  })
  .option('interval', {
    alias: 'i',
    describe: 'scrape interval',
    group: 'Scape settings:',
    number: true,
    default: 600
  })
  .option('spread', {
    alias: 's',
    describe: 'spread request over interval',
    group: 'Scape settings:',
    boolean: true,
    default: false
  })
  .option('scraper', {
    alias: 'S',
    describe: 'enable or disable scraper',
    group: 'Scape settings:',
    array: true,
    default: [
      'collaborators',
      'summarize',
      'rate-limit',
      'contributors',
      'status',
      'traffic-clones',
      'traffic-top-paths',
      'traffic-top-referrers',
      'traffic-views'
    ],
    coerce: (opt) => commaListToArray(opt).filter((item) => !item.match(/(^$|\.\.)/))
  })
  .option('organization', {
    alias: 'o',
    describe:
      'GitHub organization to scrape. Can be defined multiple times or comma separated list',
    group: 'Scape targets:',
    array: true,
    default: [],
    coerce: commaListToArray
  })
  .option('user', {
    alias: 'u',
    describe: 'GitHub users to scrape. Can be defined multiple times or comma separated list',
    group: 'Scape targets:',
    array: true,
    default: [],
    coerce: commaListToArray
  })
  .option('repository', {
    alias: 'r',
    describe:
      "GitHub's repositories to scrape. Can be defined multiple times or comma-separated list. Format: <owner>/<repo>",
    group: 'Scape targets:',
    array: true,
    default: [],
    coerce: commaListToArray
  })
  .option('host', {
    describe: 'address to bind exporter',
    default: '::',
    group: 'Bind options:'
  })
  .option('port', {
    alias: 'p',
    describe: 'port to bind exporter',
    default: 9171,
    group: 'Bind options:',
    number: true
  })
  .option('log-level', {
    describe: 'log level of application',
    default: 'info',
    group: 'Log options:',
    choices: Object.keys(winston.config.npm.levels)
  })
  .option('log-file', {
    describe: 'path to log file',
    group: 'Log options:',
    coerce: (filePath) => fs.writeFileSync(filePath, '', { flag: 'a+' })
  })
  .option('log-console', {
    describe: 'log to console',
    group: 'Log options:',
    boolean: true,
    default: true
  })
  .option('log-format', {
    describe: 'log format of application',
    default: 'cli',
    group: 'Log options:',
    coerce: (format) => {
      if (format in winston.format) {
        return format
      }
      throw Error(`Unknown log format ${format}!`)
    }
  })
  .env('GITHUB_EXPORTER')
  .showHelpOnFail(true)
  .help('help')
  .alias('help', 'h')
  .epilogue(
    'Environment variable support. Prefix: GITHUB_EXPORTER, e.g. --auth == GITHUB_EXPORTER_AUTH\n\nfor more information, find our manual at https://github.com/jkroepke/github_exporter'
  )
  .wrap(null).argv
