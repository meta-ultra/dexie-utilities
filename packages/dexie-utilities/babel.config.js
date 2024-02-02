module.exports = {
  presets: [
    ["@babel/preset-env"],
    [
      "@babel/preset-react",
      {
        /**
         * With default true "classic" which would transform jsx to React.createElement,
         * that requires us put `import React from "react"` import statement in each jsx or tsx file.
         * With "automatic", babel will do that for us.
         */
        runtime: "automatic",
      },
    ],
    "@babel/preset-typescript",
  ],
  env: {
    production: {
      plugins: ["@babel/plugin-transform-react-constant-elements"],
    },
  },
};
