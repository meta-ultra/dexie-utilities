const { readFileSync } = require("node:fs");
const { isAbsolute, join } = require("node:path");
const { isArray, trim, isEmpty, camelCase, isObject } = require("lodash");
const Handlebars = require("handlebars");

const cvtColumnName2TSPropName = camelCase;
function cvtColumnType2TSType (type) {
  const mappings = [
    [/^(string|(var)?char|text)$/i, "string"],
    [/^(number|smallint|int(eger)?|long|float8?|bigint|real|numeric|\d+(\.\d*)?)$/i, "number"],
    [/^(bool(ean)?)$/i, "boolean"],
    [/^(date|datetime|time(stampz?)?|interval)$/i, "Date"],
  ];
  const mapping = mappings.find(([re]) => re.test(type));

  return mapping ? mapping[1] : "any";
}
function cvtColumnType2YupSchemaType (type) {
  const mappings = [
    [/^(string|(var)?char|text)$/i, "string"],
    [/^(smallint|int(eger)?|long|bigint|\d+)$/i, "integer"],
    [/^(number|float8?|real|numeric|\d+\.\d*)$/i, "number"],
    [/^(bool(ean)?)$/i, "boolean"],
    [/^(date|datetime|time(stampz?)?|interval)$/i, "date"],
  ];
  const mapping = mappings.find(([re]) => re.test(type));

  return mapping ? mapping[1] : "any";
}

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

const registerHandlers = (...fns) => {
  fns.forEach((fn) => {
    if (typeof fn === "function") {
      Handlebars.registerHelper(fn.name, fn);
    }
    else if (isArray(fn)) {
      registerHandlers(...fn);
    }
    else if (isObject(fn)) {
      registerHandlers(...Object.values(fn));
    }
  });
};

function tokenizeReference(ref) {
  let [tableName, condition, fieldName] = trim(ref).split(".");
  if (fieldName === undefined) {
    fieldName = condition;
    condition = "";
  }
  condition = trim(condition.replace(/^\(|\)$/g, ""));
  condition = isEmpty(condition) ? undefined : condition;

  return [tableName, condition, fieldName];
}

function tokenizeName(name) {
  const re = /[A-Z]/;
  const tokens = name.split(/[-_.]/);
  return tokens.reduce((tokens, token) => {
    let match = re.exec(token);
    while (match) {
      const subToken = token.substring(0, match.index).toLowerCase();
      if (subToken) {
        tokens.push(subToken);
      }
      token = token[match.index].toLowerCase() + token.slice(match.index + 1);
      match = re.exec(token);
    }
    if (token) {
      tokens.push(token.toLowerCase());
    }

    return tokens;
  }, []);
}

function cvtObj2ReactPropsString(obj) {
  const props = [];
  for (const [name, value] of Object.entries(obj)) {
    props.push(`${name}={${JSON.stringify(value)}}`);
  }

  return props.join(" ");
}

module.exports = {
  cvtColumnName2TSPropName,
  cvtColumnType2TSType,
  cvtColumnType2YupSchemaType,
  cvtObj2ReactPropsString,
  readFileContentSync,
  generateCodeOnFly,
  splashify,
  registerHandlers,
  tokenizeReference,
  tokenizeName,
};