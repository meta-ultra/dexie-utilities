const { join, relative } = require("node:path");
const { globSync } = require("glob");
const { camelCase } = require("lodash");
const { upperCamelCase } = require("../commonHandlebarsHelpers.js");
const { registerHandlers, splashify, readFileContentSync, generateCodeOnFly } = require("../utils.js");
const handlebarsHelpers = require("./handlebarsHelpers.js");

// register Dexie-specific Handlebars helpers
registerHandlers(handlebarsHelpers);

function camelCaseInitial(initial) {
  const camelCasedInitial = [];
  for (const item of initial) {
    const obj = {};
    for (const [name, value] of Object.entries(item)) {
      obj[camelCase(name)] = value;
    }
    camelCasedInitial.push(obj);
  }

  return camelCasedInitial;
}

function generateDexieCode(metadata) {
  const templateDirRelativePath = "../../templates/dexie";
  const files = {};
  const absolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/*.*")));
  const paths = absolutePaths.map((absolutePath) => [absolutePath, splashify(relative(__dirname, absolutePath))]);
  for (const [absolutePath, relativePath] of paths) {
    if (/\.hbs$/i.test(relativePath)) {
      files[`${relativePath.replace(templateDirRelativePath, "").replace(/\.hbs$/i, "")}`] = generateCodeOnFly(absolutePath, {metadata});
    }
    else {
      files[`${relativePath.replace(templateDirRelativePath, "")}`] = readFileContentSync(absolutePath);
    }
  }

  const entitiesAbsolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/entities/**/*.*")));
  const entitiesPaths = entitiesAbsolutePaths.map((absolutePath) => [absolutePath, splashify(relative(__dirname, absolutePath))]);
  for (const [tableName, tableMetadata] of Object.entries(metadata)) {
    for (const [absolutePath, relativePath] of entitiesPaths) {
      if (/\.hbs$/i.test(relativePath)) {
        files[`${relativePath.replace(templateDirRelativePath, "").replace(/{{Entity}}/g, upperCamelCase(tableName)).replace(/\.hbs$/i, "")}`] = generateCodeOnFly(
          absolutePath, 
          {
            tableName, 
            $table: tableMetadata.$table,
            $dexie: tableMetadata.$dexie,
            "$dexie-foreigns": tableMetadata["$dexie-foreigns"],
            "$dexie-many": tableMetadata["$dexie-many"],
            "initial": JSON.stringify(camelCaseInitial(tableMetadata["initial"] || [])),
          }
        );
      }
      else {
        files[`${relativePath.replace(templateDirRelativePath, "").replace(/{{Entity}}/g, upperCamelCase(tableName))}`] = readFileContentSync(absolutePath);
      }
    }
  }

  return files;
}

module.exports = generateDexieCode;