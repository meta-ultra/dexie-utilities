const { join, relative } = require("node:path");
const { globSync } = require("glob");
const { registerHandlers, splashify, readFileContentSync, generateCodeOnFly } = require("../utils.js");
const { pluralizeKebabCase } = require("../commonHandlebarsHelpers.js");
const handlebarsHelpers = require("./handlebarsHelpers.js");

// register route-handlers-specific Handlebars helpers
registerHandlers(handlebarsHelpers);

function generateRouteHandlersCode(metadata, databasePackage) {
  const templateDirRelativePath = "../../templates/route-handlers";
  const absolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/**/*.*")));
  const paths = absolutePaths.map((absolutePath) => [absolutePath, splashify(relative(__dirname, absolutePath))]);

  const files = {};
  for (const [tableName, tableMetadata] of Object.entries(metadata)) {
    for (const [absolutePath, relativePath] of paths) {
      if (/\.hbs$/i.test(relativePath)) {
        files[`${pluralizeKebabCase(tableName)}${relativePath.replace(templateDirRelativePath, "").replace(/\.hbs$/i, "")}`] = generateCodeOnFly(
          absolutePath, 
          {
            tableName,
            "$route-handlers": tableMetadata["$route-handlers"],
            "$route-handlers-foreigns": tableMetadata["$route-handlers-foreigns"],
            "$route-handlers-many": tableMetadata["$route-handlers-many"],
            databasePackage,
          }
        );
      }
      else {
        files[`${pluralizeKebabCase(tableName)}${relativePath.replace(templateDirRelativePath, "")}`] = readFileContentSync(absolutePath);
      }
    }
  }

  return files;
}

module.exports = generateRouteHandlersCode;