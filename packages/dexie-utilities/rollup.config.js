const commonjs = require("rollup-plugin-commonjs");
const babel = require("rollup-plugin-babel");
const nodeResolve = require("rollup-plugin-node-resolve");
const replace = require("rollup-plugin-replace");
const { uglify } = require("rollup-plugin-uglify");
const pkg = require("./package.json");
const nodePolyfills = require("rollup-plugin-polyfill-node");

const extensions = [".tsx", ".ts", ".jsx", ".js"];

module.exports = {
  input: "./src/index.ts",
  output: [
    pkg.main && {
      file: pkg.main,
      format: "cjs",
    },
    pkg.module && {
      file: pkg.module,
      format: "esm",
    },
    pkg.unpkg && {
      file: pkg.unpkg,
      format: "umd",
      name: "AppRouter",
      // https://rollupjs.org/guide/en/#outputglobals
      globals: {},
    },
  ],
  external: [],
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    }),
    process.env.NODE_ENV === "production" && uglify(),
    nodeResolve({
      extensions,
      modulesOnly: true,
      preferBuiltins: false,
    }),
    nodePolyfills(),
    commonjs(),
    babel({
      runtimeHelpers: true,
      exclude: "./node_module/**/*",
      extensions,
    }),
  ],
};
