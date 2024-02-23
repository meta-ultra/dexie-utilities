const { join, relative } = require("node:path");
const { globSync } = require("glob");
const { registerHandlers, splashify, readFileContentSync, generateCodeOnFly } = require("../utils.js");
const { pluralizeKebabCase } = require("../commonHandlebarsHelpers.js");
const handlebarsHelpers = require("./handlebarsHelpers.js");

// register route-handlers-specific Handlebars helpers
registerHandlers(handlebarsHelpers);

function generateUICode(metadata) {
  const templateDirRelativePath = "../../templates/ui";
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
            $table: tableMetadata.table,
            $ui: tableMetadata.$ui,
            "$ui-foreigns": tableMetadata["$ui-foreigns"],
            "$ui-many": tableMetadata["$ui-many"],
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

module.exports = generateUICode;