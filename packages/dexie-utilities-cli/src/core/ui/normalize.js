const { get, cloneDeep, isNumber, camelCase } = require("lodash");
const { cvtColumnName2TSPropName, cvtColumnType2TSType, cvtColumnType2YupSchemaType, tokenizeReference } = require("../utils.js");

function getUITitle(metadata, ui, columnName, column) {
  if (ui[columnName] && ui[columnName].title) {
    return ui[columnName].title;
  }
  else if (column.title) {
    return column.title;
  }
  else if (column["foreign-key-references"]) {
    const [foreignTableName, condition, foreignFieldName] = tokenizeReference(column["foreign-key-references"]);
    return metadata[foreignTableName].table.title;
  }
}
/**
 * @param {*} $uiColumn - the property called `$ui` will be being attached to table in the final metadata object.
 * @param {*} ui - the original ui property defined by user.
 * @param {*} yup - the original yup property defined by user. 
 * @param {*} columnName - the column name defined by user.
 * @param {*} column - one of the original columns property defined by user.
 * @returns 
 */
function setControls($uiColumn, ui, yup, columnName, column) {
  if (column["primary-key"]) return;

  if (column["foreign-key-references"]) {
    const [foreignTableName, condition, foreignFieldName] = tokenizeReference(column["foreign-key-references"]);
    $uiColumn.controls = get(ui, `${columnName}.controls`) || "Select";
    $uiColumn.dataSource = get(ui, `${columnName}.dataSource`) || foreignTableName;
    $uiColumn.value = (get(ui, `${columnName}.value`) || [foreignTableName, foreignFieldName].join(".")).split(".").map((part) => camelCase(part)).join(".");
    $uiColumn.label = get(ui, `${columnName}.label`) || [foreignTableName, foreignFieldName].join(".").split(".").map((part) => camelCase(part)).join(".");
  }
  else if ($uiColumn.type === "Date") {
    $uiColumn.controls = get(ui, `${columnName}.controls`) || "DatePicker";
    $uiColumn.format = get(ui, `${columnName}.format`) || "YYYY/MM/DD HH:mm:ss";
  }
  else if ($uiColumn.type === "number") {
    $uiColumn.controls = get(ui, `${columnName}.controls`) || "InputNumber";
    $uiColumn.min = get(ui, `${columnName}.min`);
    if (!isNumber($uiColumn.min)) {
      $uiColumn.min = "undefined";
    }
    $uiColumn.max = get(ui, `${columnName}.max`);
    if (!isNumber($uiColumn.max)) {
      $uiColumn.max = "undefined";
    }
    $uiColumn.precision = get(ui, `${columnName}.precision`);
    if (!isNumber($uiColumn.precision)) {
      $uiColumn.precision = "undefined";
    }
  }
  else {
    $uiColumn.controls = get(ui, `${columnName}.controls`) || "Input";
    $uiColumn.yup = yup[columnName];
    $uiColumn.maxLength = get(ui, `${columnName}.maxLength`) || column.length;
    if (!isNumber($uiColumn.maxLength)) {
      $uiColumn.maxLength = "undefined";
    }
  }
}
function getUIRequired(ui, columnName, column) {
  const required = get(ui, `${columnName}.required`);
  if (required !== undefined) {
    return !!required;
  }
  else {
    return !!column["not-null"];
  }
}
function setUITableColumn($uiColumn, ui, columnName) {
  const tableColumn = $uiColumn["table-column"] = {};
  tableColumn["sorter"] = get(ui, `table-columns.${columnName}.sorter`);
  if (tableColumn["sorter"] === undefined) {
    tableColumn["sorter"] = true;
  }
  tableColumn["width"] = get(ui, `table-columns.${columnName}.width`);
  if (tableColumn["width"] === undefined) {
    tableColumn["width"] = ($uiColumn.title ? $uiColumn.title.length * 80 : "undefined");
  }
  tableColumn["align"] = get(ui, `table-columns.${columnName}.align`) || "center";
}

function frame$UI(metadata, tableName, columnName, ui, yup) {
  const column = metadata[tableName].columns[columnName];
  const $ui = metadata[tableName]["$ui"] = metadata[tableName]["$ui"] || {};
  const name = cvtColumnName2TSPropName(columnName);
  $ui[name] = {
    title: getUITitle(metadata, ui, columnName, column),
    yupType: cvtColumnType2YupSchemaType(column.type),
    type: cvtColumnType2TSType(column.type),
    required: getUIRequired(ui, columnName, column),
    isRef: !!column["foreign-key-references"],
  };

  setControls($ui[name], ui, yup, columnName, column);
  setUITableColumn($ui[name], ui, columnName);
}

function frame$UIForeigns(metadata, tableName) {
  const $uiForeigns = metadata[tableName]["$ui-foreigns"] = cloneDeep(metadata[tableName]["$foreigns"]) || [];
  for (const item of $uiForeigns) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].foreignColumnName = cvtColumnName2TSPropName(item[1].foreignColumnName);
  }
}
function frame$UIMany(metadata, tableName) {
  const $uiMany = metadata[tableName]["$ui-many"] = cloneDeep(metadata[tableName]["$many"]) || [];
  for (const item of $uiMany) {
    item[0] = cvtColumnName2TSPropName(item[0]);
    item[1].manyColumnName = cvtColumnName2TSPropName(item[1].manyColumnName);
  }
}

function sort$UI(metadata, tableName) {
  const sortedEntries = Object.entries(metadata[tableName]["$ui"]).sort((a, b) => {
    return b[1].controls === "Input.TextArea"  ? -1 : 0 
  });
  metadata[tableName]["$ui"] = Object.fromEntries(sortedEntries);
}

module.exports = {
  frame$UI,
  frame$UIForeigns,
  frame$UIMany,
  sort$UI,
};