const { trim } = require("lodash");

const TABLE_NAME_RE = /^[a-z][0-9a-z_-]*$/i;
const FIELD_NAME_RE = /^[a-z][0-9a-z_-]*$/i;

function normalizeFieldType(field) {
  if (/^(string|char)$/i.test(field.type)) {
    field["$original-type"] = field.type;
    field.type = "string";
  }
  else if (/^(number|int(eger)?|long|float|bigint|\d+(\.\d*)?)$/i.test(field.type)) {
    field["$original-type"] = field.type;
    field.type = "number";
  }
  else if (/^(bool(ean)?)$/i.test(field.type)) {
    field["$original-type"] = field.type;
    field.type = "boolean";
  }
  else if (/^(bool(ean)?|true|false)$/i.test(field.type)) {
    field["$original-type"] = field.type;
    field.type = "boolean";
  }
  else if (/^(date|datetime|time)$/i.test(field.type)) {
    field["$original-type"] = field.type;
    field.type = "Date";
  }
  else {
    field["$original-type"] = field.type;
    field.type = "any";
  }
}

function resolveReference(metadata, tableName, fieldName) {
  const table = metadata[tableName];
  if (!table) return;
  const field = table[fieldName];
  if (!field) return;

  const foreigns = metadata[tableName]["$foreigns"] = metadata[tableName]["$foreigns"] || [];
  let ref = trim(field.ref || "");
  if (ref) {
    const [foreignTableName, condition, foreignFieldName] = ref.split(".");
    const foreignField = resolveReference(metadata, foreignTableName, foreignFieldName ? foreignFieldName : condition);

    field.type = foreignField.type;
    foreigns.push([fieldName, {
      entityName: foreignTableName,
      condition: foreignFieldName ? condition.replace(/^\(|\)$/g, "") : undefined,
      fieldName: foreignFieldName ? foreignFieldName : condition,
    }]);
  }
  else {
    return field;
  }
}

function normalize(metadata) {
  const tableNames = Object.keys(metadata).filter((name) => TABLE_NAME_RE.test(name));
  for (const tableName of tableNames) {
    const table = metadata[tableName];
    const fieldNames = Object.keys(table).filter((name) => FIELD_NAME_RE.test(name));
    for (const fieldName of fieldNames) {
      resolveReference(metadata, tableName, fieldName);
      normalizeFieldType(table[fieldName]);
    }
  }

  return metadata;
}

module.exports = {
  normalize
};