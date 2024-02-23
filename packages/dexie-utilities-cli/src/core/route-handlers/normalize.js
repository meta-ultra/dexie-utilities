const { get, cloneDeep } = require("lodash")
const { cvtColumnName2TSPropName, cvtColumnType2TSType, cvtColumnType2YupSchemaType } = require("../utils.js");

function frame$RouteHandlersForeigns(metadata, tableName) {
  const $routeHandlersForeigns = metadata[tableName]["$route-handlers-foreigns"] = cloneDeep(metadata[tableName]["$foreigns"]) || [];
  for (const item of $routeHandlersForeigns) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].foreignColumnName = cvtColumnName2TSPropName(item[1].foreignColumnName);
  }
}

function frame$RouteHandlersMany(metadata, tableName) {
  const $routeHandlersMany = metadata[tableName]["$route-handlers-many"] = cloneDeep(metadata[tableName]["$many"]) || [];
  for (const item of $routeHandlersMany) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].manyColumnName = cvtColumnName2TSPropName(item[1].manyColumnName);
  }
}
function frame$RouteHandlers(metadata, tableName, columnName, dexie, yup) {
  const column = metadata[tableName].columns[columnName];
  const $routeHandlers = metadata[tableName]["$route-handlers"] = metadata[tableName]["$route-handlers"] || {};
  $routeHandlers[cvtColumnName2TSPropName(columnName)] = {
    title: column.title,
    yupType: cvtColumnType2YupSchemaType(column.type),
    type: cvtColumnType2TSType(column.type),
    required: !!column["not-null"],
    indexed: !get(dexie, `${columnName}.not-indexed`),
    isPrimary: !!column["primary-key"],
    length: column.length,
    yup: yup[columnName],
  };
}

module.exports = {
  frame$RouteHandlersForeigns,
  frame$RouteHandlersMany,
  frame$RouteHandlers,
};