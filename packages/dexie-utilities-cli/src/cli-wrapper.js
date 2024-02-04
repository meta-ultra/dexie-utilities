const { isAbsolute, join, sep } = require("node:path")
const { writeFileSync } = require("node:fs")
const cac = require('cac')
const { debounce } = require("lodash");
const { watch } = require("chokidar"); // https://github.com/paulmillr/chokidar
const { format } = require("prettier"); // https://prettier.io/docs/en/api.html
const fs = require("node:fs");
const toml = require("@ltd/j-toml");
const concat = require("concat-stream");

const cli = cac('dexie-utilities');

cli.help();
cli.version('0.1.0');

cli.option('--watch, -w', 'Enable watch mode', {
  default: false,
})
cli.option('--watch-aggregate-timeout [timeout]', 'Add a delay(ms) before rebuilding once the first file added or removed', {
  default: 700,
})
cli.option('--base-url [baseUrl]', 'The baseUrl for route handlers, defaults to process.env.REACT_APP_BASE_URL', {
  default: "process.env.REACT_APP_BASE_URL",
})
cli.option('--mock-adapter [mockAdapter]', 'The import statement path of mock adapter, defaults to "./utils/mockAdapter"', {
  default: "./utils/mockAdapter",
})
cli.option('--source, -s [folder]', 'The app folder path', {
  default: './src/app',
})
cli.option('--output, -o [file]', 'The router file path', {
  default: './src/router.tsx',
})

const parsed = cli.parse()
if (!parsed.options.h && !parsed.options.v) {
  const sourcePath = isAbsolute(cli.options.source) ? cli.options.source : join(process.cwd(), cli.options.source)
  const outputPath = isAbsolute(cli.options.output) ? cli.options.output : join(process.cwd(), cli.options.output)

  const main = async () => {
     
  fs.createReadStream(join(__dirname, '../examples/metadata.toml'), 'utf8').pipe(concat(function(data) {
    var parsed = toml.parse(data);
    console.dir(parsed);
  }));

    // if (cli.options.watch) {
    //   console.log('dexie-utilities is running.');
    // }
  };

  if (cli.options.watch) {
    const handleChange = debounce(main, Number(cli.options.watchAggregateTimeout) || 300)
    watch(sourcePath).on('add', handleChange)
    watch(sourcePath).on('addDir', handleChange)
    watch(sourcePath).on('unlink', handleChange)
    watch(sourcePath).on('unlinkDir', handleChange)
  } else {
    main()
  }
}
