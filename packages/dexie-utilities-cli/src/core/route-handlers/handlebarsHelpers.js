const { pickBy, get, isNumber, groupBy, first, identity } = require("lodash");
const Handlebars = require("handlebars");

/**
 * Frame the yup schema. 
 */
const frameRouteHandlersYupSchema = (field, strict) => {
  const schema = [`${field.yupType === "integer" ? "number" : field.yupType}()`];
  if (["number", "integer"].indexOf(field.yupType) !== -1) {
    if (field.yupType === "integer") {
      schema.push("integer()");
    }

    if ("min" in field) {
      schema.push(`min(${field.min})`);
    }
    if ("max" in field) {
      schema.push(`max(${field.max})`);
    }
  }

  if (field.yupType === "string") {
    if (isNumber(field.length)) {
      schema.push(`max(${field.length})`);
    }

    const regexp = get(field, "yup.regexp");
    if (regexp) {
      schema.push(`matches(RegExp("${regexp}"))`);
    }
  }

  if (strict === true && field.required) {
    schema.push("required()");
  }

  return schema.length ? new Handlebars.SafeString(schema.join(".")) : "";
};

const getRouteHandlersPrimaryKeys = ($routeHandlers) => {
  return pickBy($routeHandlers, (value, key) => {
    return value.isPrimary;
  });
};

/**
 * Retrieve the table names for the foreign keys from the many side.
 * Note that, the table name will be ignored when it exists multiple times.
 */
const getRouteHandlersManyTableNames = ($dexieMany) => {
  const tableNames = [];
  for (let i = 0; i < $dexieMany.length; i++) {
    const tableName = get($dexieMany[i], "1.manyTableName");
    tableNames.push(tableName);
  }
  const result = Object.values(groupBy(tableNames, identity))
  .filter((tableNames) => tableNames.length === 1)
  .map(first);

  return result;
};

/**
 * Get the available many to build many properties inside the foreign entity.
 */
const filterRouteHandlersMany = ($routeHandlersMany) => {
  const manyTableNames = getRouteHandlersManyTableNames($routeHandlersMany);
  return $routeHandlersMany.filter((item) => {
    return manyTableNames.indexOf(item[1].manyTableName) !== -1;
  });
}

module.exports = {
  frameRouteHandlersYupSchema,
  getRouteHandlersPrimaryKeys,
  filterRouteHandlersMany,
};