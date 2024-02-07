const { isAbsolute, join, sep, dirname } = require("node:path")
const { writeFileSync, createReadStream, writeFile, mkdir } = require("node:fs")
const toml = require("@ltd/j-toml");
const concat = require("concat-stream");
const cac = require('cac')
const { debounce } = require("lodash");
const { watch } = require("chokidar"); // https://github.com/paulmillr/chokidar
const { format } = require("prettier"); // https://prettier.io/docs/en/api.html
const { normalize } = require("./core/normalize.js");
const { convertToEntries } = require("./core/convertToEntries.js");
const { generateCode } = require("./core/generateCode.js");

const cli = cac('dexie-utilities');

cli.help();
cli.version('0.1.0');

cli.option('--watch, -w', 'Enable watch mode', {
  default: false,
})
cli.option('--watch-aggregate-timeout [timeout]', 'Add a delay(ms) before rebuilding once the first file added or removed', {
  default: 700,
})
// cli.option('--base-url [baseUrl]', 'The baseUrl for route handlers, defaults to process.env.REACT_APP_BASE_URL', {
//   default: "process.env.REACT_APP_BASE_URL",
// })
// cli.option('--mock-adapter [mockAdapter]', 'The import statement path of mock adapter, defaults to "./utils/mockAdapter"', {
//   default: "./utils/mockAdapter",
// })
cli.option('--filter [regexp]', 'The app folder path');
cli.option('--source, -s [folder]', 'The app folder path', {
  default: './src/metadata.toml',
});
cli.option('--db-output [file]', 'The router file path', {
  default: './src/db',
});
cli.option('--db-package [file]', 'The router file path', {
  default: '@/db',
});
cli.option('--route-handlers-output [file]', 'The router file path', {
  default: './src/app/api',
});

const parsed = cli.parse()
if (!parsed.options.h && !parsed.options.v) {
  const filter =  parsed.options.filter;
  const sourcePath = isAbsolute(parsed.options.source) ? parsed.options.source : join(process.cwd(), parsed.options.source);
  const dbOutputPath = isAbsolute(parsed.options.dbOutput) ? parsed.options.dbOutput : join(process.cwd(), parsed.options.dbOutput);
  const routeHandlersOutputPath = isAbsolute(parsed.options.routeHandlersOutput) ? parsed.options.routeHandlersOutput : join(process.cwd(), parsed.options.routeHandlersOutput);
  const databasePackage =  parsed.options.dbPackage || "@/db";

  const main = async () => {
    createReadStream(join(sourcePath), 'utf8').pipe(concat(async function(data) {
      var metadata = toml.parse(data, { bigint: false });
      normalize(metadata);
      let entities = convertToEntries(metadata);
      if (filter) {
        const re = RegExp(filter);
        entities = entities.filter(([entityName]) => re.test(entityName));
      }
      const {db, routeHandlers} = generateCode(entities, databasePackage);

      await Promise.all(Object.entries(db).map(([path, source]) => {
        return new Promise((resolve, reject) => {
          const fullPath = join(dbOutputPath, path);
          mkdir(dirname(fullPath), { recursive: true }, (err) => {
            if (!err) {
              writeFile(fullPath, source, "utf-8", (err) => {
                if (err) {
                  reject(err);
                }
                else {
                  resolve();
                }
              });
            }
          });
        })
      }));

      await Promise.all(Object.entries(routeHandlers).map(([path, source]) => {
        return new Promise((resolve, reject) => {
          const fullPath = join(routeHandlersOutputPath, path);
          mkdir(dirname(fullPath), { recursive: true }, (err) => {
            if (!err) {
              writeFile(fullPath, source, "utf-8", (err) => {
                if (err) {
                  reject(err);
                }
                else {
                  resolve();
                }
              });
            }
          });
        })
      }));
    }));

    if (cli.options.watch) {
      console.log('dexie-utilities is running.');
    }
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
