/*eslint-disable*/
const { readFileSync } = require("node:fs");
const { join, isAbsolute, relative } = require("node:path");
const { globSync } = require("glob");
const Handlebars = require("handlebars");
// const { get, isString, camelCase, upperFirst, lowerCase, kebabCase, capitalize } = require("lodash");
const { camelCase, upperFirst, kebabCase } = require("lodash");
const { pluralize } = require("./handlebars/registerHelpers.js");
// const { tokenizeReference, tokenizeName } = require("./utils.js");

/* Utilities */
// const pluralize = (x) => {
//   return /(ch|sh|x|s)$/.test(x) ? x + "es" : x + "s";
// };
/* End of Utilities */

/* Register Helpers */
// Handlebars.registerHelper("get", (obj, name) => get(obj, name));
// Handlebars.registerHelper("join", (array, sep) => array.join(sep));
// Handlebars.registerHelper("isNil", (value) => value === undefined || value === null);
// Handlebars.registerHelper(
//   "isNilorEmpty",
//   (...args) => {
//     const values = args.slice(0, args.length - 1);
//     let result = true;
//     for (let i = 0; result && i < values.length; ++i) {
//       const value = values[i];
//       result = result && (value === undefined || value === null || !value.length);
//     }

//     return result;
//   }
// );
// Handlebars.registerHelper("lowerCase", (value) => isString(value) ? lowerCase(value) : value);
// Handlebars.registerHelper("frameYupSchema", (field, strict) => {
//   const schema = [`${lowerCase(field.type)}()`];
//   if (field.type === "number") {
//     // schema for number
//     if (/int(eger)?/i.test(field["$original-type"])) {
//       schema.push("integer()");
//     }

//     if (strict === true) {
//       if ("min" in field) {
//         schema.push(`min(${field.min})`);
//       }
//       if ("max" in field) {
//         schema.push(`max(${field.max})`);
//       }
//     }
//   }

//   if (field.type === "string") {
//     if (strict === true) {
//       if ("format" in field) {
//         schema.push(`matches(RegExp("${field.format}"))`);
//       }
//     }
//   }

//   if (strict === true && field.required) {
//     schema.push("required()");
//   }

//   return schema.length ? new Handlebars.SafeString(schema.join(".")) : "";
// });
// Handlebars.registerHelper("getPrimaryField", (fields) => {
//   const field = fields.find((field) => {
//     return field[1]["primary-key"] || field[1]["auto-increment"];
//   })
//   return field;
// });
// Handlebars.registerHelper(
//   "upperCamelCase",
//   (value) => {
//     if (isString(value)) {
//       return upperFirst(camelCase(value));
//     }
//     else {
//       return value;
//     }
//   }
// );
// Handlebars.registerHelper(
//   "getTableName",
//   (value) => {
//     if (isString(value)) {
//       return pluralize(value);
//     }
//     else {
//       return value;
//     } 
//   }
// );
// Handlebars.registerHelper(
//   "getIndexes",
//   (fields) => {
//     if (fields && fields.length) {
//       let indexes = fields.reduce((indexes, field) => {
//         const fieldOpts = field[1];
//         if (fieldOpts.indexed !== false) {
//           const fieldName = field[0];
//           indexes.push(`${fieldOpts["auto-increment"] ? "++" : ""}${fieldName}`);
//         }

//         return indexes;
//       }, []);
//       indexes = indexes.sort((a,b)=>{
//         const aScore = a.startsWith("++") ? 0 : 1; 
//         const bScore = b.startsWith("++") ? 0 :1; 
//         return aScore - bScore > 0 ? 1 : -1;
//       })
//       return indexes.join(", ");
//     }
//     else {
//       return "";
//     }
//   }
// );
// Handlebars.registerHelper(
//   "getKeyType",
//   (fields) => {
//     if (fields && fields.length) {
//       const keyField = fields.find((field) => field[1] && field[1]["auto-increment"]);
//       return keyField[1].type;
//     }
//     else {
//       return "any";
//     }
//   }
// );
// const getFieldScore = (field) => {
//   return field[1].required ? 2 : field[1]["auto-increment"] ? 1 : 0
// };
// Handlebars.registerHelper(
//   "sortByRequiredFirst",
//   (fields) => {
//     return fields.sort((a, b) => getFieldScore(a) - getFieldScore(b) > 0 ? -1 : 1);
//   }
// );
// Handlebars.registerHelper(
//   "nameForignField",
//   (fieldName, foreignFieldName) => {
//     return camelCase(fieldName.replace(RegExp(foreignFieldName + "$", "i"), ""));
//   }
// );
// Handlebars.registerHelper(
//   "pluralizeLowerCamelCase",
//   (fieldName) => {
//     return pluralize(camelCase(fieldName));
//   }
// );
// Handlebars.registerHelper(
//   "pluralizeKebabCase",
//   (fieldName) => {
//     return pluralize(kebabCase(fieldName));
//   }
// );
// Handlebars.registerHelper(
//   "getEntityNameOfForeigns",
//   (foreigns, many) => {
//     const entityNames = new Set();
//     for (const foreign of foreigns) {
//       entityNames.add(foreign[1].entityName);
//     }
//     for (const one of many) {
//       entityNames.add(one[1].entityName);
//     }

//     return Array.from(entityNames);
//   }
// );
// Handlebars.registerHelper(
//   "getQueryFormControls",
//   (entity) => {
//     const [entityName, entityCofig] = entity;
//     let controls = "";
//     if (/^Input$/i.test(entityCofig["$ui"].controls)) {
//       controls = `<Input allowClear maxLength={${entityCofig["$ui"].maxLength}}/>`;
//     }
//     else if (/^InputNumber$/i.test(entityCofig["$ui"].controls)) {
//       controls = `<InputNumber allowClear min={${entityCofig["$ui"].min}} max={${entityCofig["$ui"].max}} precision={${entityCofig["$ui"].precision}} />`;
//     }
//     else if (/^DatePicker$/i.test(entityCofig["$ui"].controls)) {
//       controls = `<DatePicker />`;
//     }
//     else if (/^Select$/i.test(entityCofig["$ui"].controls)) {
//       controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${getForeignPropertyName(entityName)} && ${getForeignPropertyName(entityName)}.map((${entityCofig["$ui"].dataSource}) => (<Select.Option key={${entityCofig["$ui"].value}} value={${entityCofig["$ui"].value}}>{${entityCofig["$ui"].label}}</Select.Option>))}</Select>`;
//     }

//     return new Handlebars.SafeString(controls);
//   }
// );
// Handlebars.registerHelper(
//   "getForeignTableName",
//   (ref) => {
//     return tokenizeReference(ref)[0];
//   }
// );
// Handlebars.registerHelper(
//   "getForeignFieldName",
//   (ref) => {
//     return tokenizeReference(ref)[2];
//   }
// );
// const getForeignPropertyName = (fieldName) => {
//   const tokens = tokenizeName(fieldName);
//   if (tokens.length < 2) {
//     throw Error(`The foreign field name should be made of two words at least, but "${fieldName}" was found!`);
//   }
//   tokens.pop();
//   return tokens.map((token, i) => i === 0 ? token : capitalize(token)).join("");
// };

// const getControlsNamedImports = (fields) => {
//   const set = fields.reduce((set, field) => {
//     if (field[1]["$ui"]["title"]) {
//       set.add(field[1]["$ui"]["controls"]);
//     }

//     return set;
//   }, new Set());

//   return Array.from(set).join(", ");
// };

// const registerHandlers = (...fns) => {
//   fns.forEach((fn) => {
//     Handlebars.registerHelper(fn.name, fn);
//   });
// };
// registerHandlers(getForeignPropertyName, getControlsNamedImports);

/* End of Register Helpers */

/* Partials on fly */
// Handlebars.registerPartial("staticImports", readTemplateSync("../templates/staticImports.hbs"));
/* End of Partials on fly*/

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
