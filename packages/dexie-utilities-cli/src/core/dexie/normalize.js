const { get, cloneDeep } = require("lodash")
const { cvtColumnName2TSPropName, cvtColumnType2TSType } = require("../utils.js");

function getDexieSchema (column) {
  if (!!column["primary-key"] && !!column["generated-by-default-as-identity"]) {
    return "++"; // auto-incremented-primary-key
  }
  else if (!!column["unique"]) {
    return "&"; // Unique
  }

  return "";
}

function frame$DexieForeigns(metadata, tableName) {
  const $dexieForeigns = metadata[tableName]["$dexie-foreigns"] = cloneDeep(metadata[tableName]["$foreigns"]) || [];
  for (const item of $dexieForeigns) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].foreignColumnName = cvtColumnName2TSPropName(item[1].foreignColumnName);
  }
}

function frame$DexieMany(metadata, tableName) {
  const $dexieMany = metadata[tableName]["$dexie-many"] = cloneDeep(metadata[tableName]["$many"]) || [];
  for (const item of $dexieMany) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].manyColumnName = cvtColumnName2TSPropName(item[1].manyColumnName);
  }
}
/**
 * Limitations: 
 * 1. Compound indexes is not supported at the moment.
 */
function frame$Dexie(metadata, tableName, columnName, dexie, mock) {
  const column = metadata[tableName].columns[columnName];
  const $dexie = metadata[tableName]["$dexie"] = metadata[tableName]["$dexie"] || {};
  $dexie[cvtColumnName2TSPropName(columnName)] = {
    title: column.title,
    type: cvtColumnType2TSType(column.type),
    required: !!column["not-null"],
    indexed: !get(dexie, `${columnName}.not-indexed`),
    schema: getDexieSchema(column),
    length: column.length,
  };
}

module.exports = {
  frame$DexieForeigns,
  frame$DexieMany,
  frame$Dexie,
}