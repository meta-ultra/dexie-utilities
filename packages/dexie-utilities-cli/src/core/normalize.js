const Nagging = require("./Nagging.js");
const { tokenizeReference } = require("./utils.js");
const { frame$Dexie, frame$DexieForeigns, frame$DexieMany } = require("./dexie/normalize.js");
const { frame$RouteHandlers, frame$RouteHandlersForeigns, frame$RouteHandlersMany } = require("./route-handlers/normalize.js");
const { frame$UI, frame$UIForeigns, frame$UIMany, sort$UI } = require("./ui/normalize.js");

const nagging = new Nagging();

function frame$Table(metadata, tableName, table) {
  const $table = metadata[tableName]["$table"] = {};
  $table.title = table.title;
}

function resolveForeignKey(metadata, sTableName, sColumnName, dTableName, dColumnName, dCondition) {
  const { columns } = metadata[sTableName];
  const column = columns[sColumnName];

  const $foreigns = metadata[sTableName]["$foreigns"] = metadata[sTableName]["$foreigns"] || [];
  let ref = column["foreign-key-references"];
  if (ref) {
    const [foreignTableName, foreignCondition, foreignColumnName] = tokenizeReference(ref);
    const foreignColumn = resolveForeignKey(metadata, foreignTableName, foreignColumnName, sTableName, sColumnName, foreignCondition);

    column.type = foreignColumn.type;
    $foreigns.push([sColumnName, {
      foreignTableName,
      foreignCondition,
      foreignColumnName,
    }]);
  }
  else if (dTableName && dColumnName) {
    if (metadata[sTableName]) {
      const $many = metadata[sTableName]["$many"] = metadata[sTableName]["$many"] || [];
      $many.push([sColumnName, {
        manyTableName: dTableName,
        manyCondition: dCondition,
        manyColumnName: dColumnName,
      }]);
    }
    
    return column;
  }
}

const NAMING_CONVENTION_RE = /^[a-z][0-9a-z_]*$/i;
function normalize(metadata) {
  const tableNames = Object.keys(metadata).filter((name) => {
    const result = NAMING_CONVENTION_RE.test(name);
    if (!result) {
      nagging.nag(`"${name}" does not align with the naming convention.`);
    }

    return result;
  });

  for (const tableName of tableNames) {
    const { table, columns, dexie = {}, ui = {}, yup = {} } = metadata[tableName];

    // TODO: validate the structure of table, columns, dexie, ui and mock

    frame$Table(metadata, tableName, table);
    for (const columnName of Object.keys(columns)) {
      // resolve foreign key to fulfill corresponding column definition
      resolveForeignKey(metadata, tableName, columnName);

      frame$Dexie(metadata, tableName, columnName, dexie);
      frame$RouteHandlers(metadata, tableName, columnName, dexie, yup);
      frame$UI(metadata, tableName, columnName, ui, yup);
    }
  }

  // Note that, the followings must be called after invoking resolveForeignKey on each table.
  for (const tableName of tableNames) {
    frame$DexieForeigns(metadata, tableName);
    frame$DexieMany(metadata, tableName);
    frame$RouteHandlersForeigns(metadata, tableName);
    frame$RouteHandlersMany(metadata, tableName);
    frame$UIForeigns(metadata, tableName);
    frame$UIMany(metadata, tableName);
    sort$UI(metadata, tableName);
  }

  return metadata;
}

module.exports = normalize;