/*eslint-disable*/
const { readFileSync } = require("node:fs");
const { join, isAbsolute, relative } = require("node:path");
const { globSync } = require("glob");
const Handlebars = require("handlebars");
const { camelCase, upperFirst, kebabCase } = require("lodash");
const { pluralize } = require("./handlebars/registerHelpers.js");


const readFileContentSync = (path) =>
  readFileSync(isAbsolute(path) ? path : join(__dirname, path)).toString("utf-8");

/**
 * render template on fly for development
 * @param {*} path - the template path
 * @param {*} context - the context parameter Handlebars template function consumes
 * @param {*} options - the options parameter Handlebars template function consumes
 * @returns
 */
const generateCodeOnFly = (path, context, options) => {
  const content = readFileContentSync(path);
  const template = Handlebars.compile(content);
  return template(context, options);
};

const splashify = (x) => x.replace(/\\/g, "/");
const generate = (templateDirRelativePath, entities, databasePackage) => {
  // replace back splash with splash, and strip the trailing splash away.
  templateDirRelativePath = splashify(templateDirRelativePath).replace(/\/\s*$/, "");
  const absolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/**/*.*")));
  const relativePaths = absolutePaths.map((absolutePath) => splashify(relative(__dirname, absolutePath)));

  const files = {};
  for (const [entityName, fields, foreigns, many] of entities) {
    for (const relativePath of relativePaths) {
      if (/\.hbs$/i.test(relativePath)) {
        files[`${pluralize(kebabCase(entityName))}${relativePath.replace(templateDirRelativePath, "").replace(/\.hbs$/i, "")}`] = generateCodeOnFly(relativePath, {entityName, fields, foreigns, many, databasePackage});
      }
      else {
        files[`${pluralize(kebabCase(entityName))}${relativePath.replace(templateDirRelativePath, "")}`] = readFileSync(join(__dirname, relativePath)).toString("utf-8");
      }
    }
  }

  return files;
}

const generateDBCode = (templateDirRelativePath, entities) => {
  const files = {};
  const absolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/*.*")));
  const relativePaths = absolutePaths.map((absolutePath) => splashify(relative(__dirname, absolutePath)));
  for (const relativePath of relativePaths) {
    if (/\.hbs$/i.test(relativePath)) {
      files[`${relativePath.replace(templateDirRelativePath, "").replace(/\.hbs$/i, "")}`] = generateCodeOnFly(relativePath, {entities});
    }
    else {
      files[`${relativePath.replace(templateDirRelativePath, "")}`] = readFileSync(join(__dirname, relativePath)).toString("utf-8");
    }
  }

  const entitiesAbsolutePaths = globSync(splashify(join(__dirname, templateDirRelativePath + "/entities/**/*.*")));
  const entitiesRelativePaths = entitiesAbsolutePaths.map((absolutePath) => splashify(relative(__dirname, absolutePath)));
  for (const [entityName, fields, foreigns, many] of entities) {
    for (const relativePath of entitiesRelativePaths) {
      if (/\.hbs$/i.test(relativePath)) {
        files[`${relativePath.replace(templateDirRelativePath, "").replace(/{{Entity}}/g, upperFirst(camelCase(entityName))).replace(/\.hbs$/i, "")}`] = generateCodeOnFly(relativePath, {entityName, fields, foreigns, many});
      }
      else {
        files[`${relativePath.replace(templateDirRelativePath, "").replace(/{{Entity}}/g, upperFirst(camelCase(entityName)))}`] = readFileSync(join(__dirname, relativePath)).toString("utf-8");
      }
    }
  }

  return files;
}

const generateCode = (entities, databasePackage) => {
  const dexie = generateDBCode("../templates/dexie", entities);
  const routeHandlers = generate("../templates/route-handlers", entities, databasePackage)
  const ui = generate("../templates/ui", entities)

  return {dexie, routeHandlers, ui};
}

module.exports = {
  generateCodeOnFly,
  readTemplateSync: readFileContentSync,
  generateCode,
}
