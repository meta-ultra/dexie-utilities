/*eslint-disable*/
const { readFileSync } = require("node:fs");
const { join, isAbsolute } = require("node:path");
const Handlebars = require("handlebars");
const { get, isString, camelCase, upperFirst } = require("lodash");

/* Utilities */
const readTemplateSync = (path) =>
  readFileSync(isAbsolute(path) ? path : join(__dirname, path)).toString("utf-8");
/* End of Utilities */

/* Register Helpers */
Handlebars.registerHelper("get", (obj, name) => get(obj, name));
Handlebars.registerHelper("join", (array, sep) => array.join(sep));
Handlebars.registerHelper("isNil", (value) => value === undefined || value === null);
Handlebars.registerHelper(
  "isNilorEmpty",
  (value) => value === undefined || value === null || !value.length
);
Handlebars.registerHelper(
  "upperCamelCase",
  (value) => {
    if (isString(value)) {
      return upperFirst(camelCase(value));
    }
    else {
      return value;
    }
  }
);
Handlebars.registerHelper(
  "getTableName",
  (value) => {
    if (isString(value)) {
      return /(ch|sh|s|x)^/.test(value) ? value + "es" : value + "s";
    }
    else {
      return value;
    } 
  }
);
Handlebars.registerHelper(
  "getIndexes",
  (fields) => {
    if (fields && fields.length) {
      return fields.reduce((indexes, field) => {
        const fieldOpts = field[1];
        if (fieldOpts.indexed !== false) {
          const fieldName = field[0];
          indexes.push(`${fieldOpts["auto-increment"] ? "++" : ""}${fieldName}`);
        }

        return indexes;
      }, []).join(", ");
    }
    else {
      return "";
    }
  }
);
Handlebars.registerHelper(
  "getKeyType",
  (fields) => {
    if (fields && fields.length) {
      const keyField = fields.find((field) => field[1] && field[1]["auto-increment"]);
      return keyField[1].type;
    }
    else {
      return "any";
    }
  }
);
const getFieldScore = (field) => {
  return field[1].required ? 2 : field[1]["auto-increment"] ? 1 : 0
};
Handlebars.registerHelper(
  "sortByRequiredFirst",
  (fields) => {
    return fields.sort((a, b) => getFieldScore(a) - getFieldScore(b) > 0 ? -1 : 1);
  }
);
Handlebars.registerHelper(
  "nameForignField",
  (fieldName, foreignFieldName) => {
    return camelCase(fieldName.replace(RegExp(foreignFieldName + "$", "i"), ""));
  }
);
/* End of Register Helpers */

/* Partials on fly */
// Handlebars.registerPartial("staticImports", readTemplateSync("../templates/staticImports.hbs"));
/* End of Partials on fly*/

/**
 * render template on fly for development
 * @param {*} path - the template path
 * @param {*} context - the context parameter Handlebars template function consumes
 * @param {*} options - the options parameter Handlebars template function consumes
 * @returns
 */
const generateCodeOnFly = (path, context, options) => {
  const content = readTemplateSync(path);
  const template = Handlebars.compile(content);
  return template(context, options);
};

const generateCode = (entities) => {
  const code = {
    "db.ts": generateCodeOnFly("../templates/DB.hbs", {entities}),
    "index.ts": generateCodeOnFly("../templates/DBIndex.hbs", {entities}),
  }
  for (const [entityName, fields, foreigns] of entities) {
    code[`entities/I${upperFirst(camelCase(entityName))}/index.ts`] = generateCodeOnFly("../templates/EntityIndex.hbs", {entityName, fields, foreigns});
    code[`entities/I${upperFirst(camelCase(entityName))}/I${upperFirst(camelCase(entityName))}.ts`] = generateCodeOnFly("../templates/IEntity.hbs", {entityName, fields, foreigns});
    code[`entities/I${upperFirst(camelCase(entityName))}/${upperFirst(camelCase(entityName))}.ts`] = generateCodeOnFly("../templates/Entity.hbs", {entityName, fields, foreigns});
    code[`entities/I${upperFirst(camelCase(entityName))}/I${upperFirst(camelCase(entityName))}Populator.ts`] = generateCodeOnFly("../templates/EntityPopulator.hbs", {entityName, fields, foreigns});
  }

  return code;
}

module.exports = {
  generateCode,
  generateCodeOnFly,
  readTemplateSync,
}
