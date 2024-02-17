const { trim, isNumber } = require("lodash");

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

function resolveReference(metadata, tableName, fieldName, condition, sTableName, sFieldName) {
  const table = metadata[tableName];
  if (!table) return;
  const field = table.fields && table.fields[fieldName];
  if (!field) return;

  const foreigns = metadata[tableName]["$foreigns"] = metadata[tableName]["$foreigns"] || [];
  let ref = trim(field.ref || "");
  if (ref) {
    const [foreignTableName, condition, foreignFieldName] = ref.split(".");
    const foreignField = resolveReference(metadata, foreignTableName, foreignFieldName ? foreignFieldName : condition, foreignFieldName ? condition : undefined , tableName, fieldName);

    field.type = foreignField.type;
    foreigns.push([fieldName, {
      entityName: foreignTableName,
      condition: foreignFieldName ? condition.replace(/^\(|\)$/g, "") : undefined,
      fieldName: foreignFieldName ? foreignFieldName : condition,
    }]);
  }
  else {
    if (metadata[sTableName]) {
      const many = metadata[tableName]["$many"] = metadata[tableName]["$many"] || [];
      many.push([fieldName, {
        entityName: sTableName,
        fieldName: sFieldName,
        manyCondition: condition,
      }]);
    }
    
    return field;
  }
}

function normalizeUIProps(field, metdata) {
  field["$ui"] = field["$ui"] || {};

  field["$ui"].title = field["$ui"].title || field.title;
  field["$ui"].required = field["$ui"].required || field.required;

  if (field.ref) {
    const foreignTableName = field.ref.split(".")[0];
    field["$ui"].title = field["$ui"].title || metdata[foreignTableName].title;
    field["$ui"].controls = field["$ui"].controls || "Select";
    field["$ui"].dataSource = field["$ui"].dataSource || foreignTableName;
    field["$ui"].value = field["$ui"].value || field.ref;
    field["$ui"].label = field["$ui"].label || field.ref;
  }
  else if (field.type === "Date") {
    field["$ui"].controls = field["$ui"].controls || "DatePicker";
  }
  else if (field.type === "number") {
    field["$ui"].controls = field["$ui"].controls || "InputNumber";
    field["$ui"].min = isNumber(field.min) ? field.min : "undefined";
    field["$ui"].max = isNumber(field.max) ? field.max : "undefined";
    field["$ui"].precision = isNumber(field.precision) ? field.precision : "undefined";
  }
  else {
    field["$ui"].controls = field["$ui"].controls || "Input";
  }
}

function normalize(metadata) {
  const tableNames = Object.keys(metadata).filter((name) => TABLE_NAME_RE.test(name));
  for (const tableName of tableNames) {
    const table = metadata[tableName];
    const fieldNames = Object.keys(table.fields || {}).filter((name) => FIELD_NAME_RE.test(name));
    for (const fieldName of fieldNames) {
      resolveReference(metadata, tableName, fieldName);
      normalizeFieldType(table.fields[fieldName]);
      normalizeUIProps(table.fields[fieldName], metadata);
    }
  }

  return metadata;
}

module.exports = {
  normalize
};