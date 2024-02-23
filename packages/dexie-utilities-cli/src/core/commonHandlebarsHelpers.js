const { isEmpty, uniq, concat, join, get, isNil, lowerCase, camelCase, upperFirst, capitalize, kebabCase } = require("lodash");
const { tokenizeName } = require("./utils.js");

const pluralize = (x) => {
  return /(ch|sh|x|s)$/.test(x) ? x + "es" : x + "s";
};

const isNilorEmpty = (...values) => {
  // To remove the argumetn which is appended by Handlebars for each helper function.
  values = values.slice(0, values.length - 1);
  let result = true;
  for (let i = 0; result && i < values.length; ++i) {
    const value = values[i];
    result = result && (isEmpty(value) || isNil(value));
  }

  return result;
};

/**
 * Convert table name to class name 
 */
const upperCamelCase = (value) => upperFirst(camelCase(value));

/**
 *  Convert table name to property name in plural
 */
const pluralizeLowerCamelCase = (fieldName) => {
  return pluralize(camelCase(fieldName));
};

const pluralizeKebabCase = (fieldName) => {
  return pluralize(kebabCase(fieldName));
};

/**
 * Name a property on top of its foreign key name, such as turn "branch_id", "branchId" or "branch-id" to "branch".
 * This function will be used in Dexie, Route Handlers and UI tiers.
 */
const getForeignPropertyName = (fieldName) => {
  const tokens = tokenizeName(fieldName);
  if (tokens.length < 2) {
    throw Error(`The foreign field name should be made of two words at least, but "${fieldName}" was found!`);
  }
  tokens.pop();
  return tokens.map((token, i) => i === 0 ? token : capitalize(token)).join("");
};

module.exports = {
  uniq,
  concat,
  get,
  join,
  isNil,
  lowerCase,
  pluralize, 
  isNilorEmpty,
  upperCamelCase,
  pluralizeLowerCamelCase,
  pluralizeKebabCase,
  getForeignPropertyName, 
};