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
    $uiColumn.controls = {
      package: get(ui, `${columnName}.controls.package`) || "antd",
      type: get(ui, `${columnName}.controls.type`) || "Select",
      dataSource: get(ui, `${columnName}.dataSource`) || foreignTableName,
      value: (get(ui, `${columnName}.controls.value`) || [foreignTableName, foreignFieldName].join(".")).split(".").map((part) => camelCase(part)).join("."),
      label: get(ui, `${columnName}.controls.label`) || [foreignTableName, foreignFieldName].join(".").split(".").map((part) => camelCase(part)).join("."),
    };
  }
  else if ($uiColumn.type === "Date") {
    $uiColumn.controls = {
      package: get(ui, `${columnName}.controls.package`) || "antd",
      type: get(ui, `${columnName}.controls.type`) || "DatePicker",
      format: get(ui, `${columnName}.controls.format`) || "YYYY/MM/DD HH:mm:ss",
    };
  }
  else if ($uiColumn.type === "number") {
    const {package, type, ...props} = get(ui, `${columnName}.controls`) || {};
    $uiColumn.controls = {
      package: package || "antd",
      type: type || "InputNumber",
      ...props
    };
    if (!isNumber($uiColumn.controls.min)) {
      delete $uiColumn.controls.min;
    }
    if (!isNumber($uiColumn.controls.max)) {
      delete $uiColumn.controls.max;
    }
    if (!isNumber($uiColumn.controls.precision)) {
      delete $uiColumn.controls.precision;
    }
  }
  else {
    const {package, type, ...props} = get(ui, `${columnName}.controls`) || {};
    $uiColumn.controls = {
      package: package || "antd",
      type: type || "Input",
      ...props
    };
    if (!isNumber($uiColumn.controls.maxLength)) {
      delete $uiColumn.controls.maxLength;
    }
    $uiColumn.yup = yup[columnName];
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


function rateControls(controls) {
  if (!controls) {
    return 0;
  }
  else if (/^picture|upload|file/i.test(controls.type)) {
    return 1;
  }
  else if (/^input\.textarea$/i.test(controls.type)) {
    return 2;
  }
  else {
    return 0;
  }
}

function sort$UI(metadata, tableName) {
  const sortedEntries = Object.entries(metadata[tableName]["$ui"]).sort((a, b) => {
    const aScore = rateControls(a[1].controls);
    const bScore = rateControls(b[1].controls);

    return aScore > bScore ? 1 : aScore === bScore ? 0 : -1;
  });
  metadata[tableName]["$ui"] = Object.fromEntries(sortedEntries);
}

module.exports = {
  frame$UI,
  frame$UIForeigns,
  frame$UIMany,
  sort$UI,
};