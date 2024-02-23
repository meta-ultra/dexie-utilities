const Handlebars = require("handlebars");
const { tokenizeReference } = require("../utils.js");
const { pluralize, getForeignPropertyName } = require("../commonHandlebarsHelpers.js");

const getControlsNamedImports = ($ui) => {
  const set = new Set();
  for (const item of Object.values($ui)) {
    if (item.controls) {
      set.add(item.controls);
    }
  }
  return Array.from(set).join(", ");
};

/**
 * Get Antd controls according to its controls property.
 */
const getQueryFormControls = (columnName, $uiColumn) => {
  let controls = "";
  if (/^Input$/i.test($uiColumn.controls)) {
    controls = `<Input allowClear maxLength={${$uiColumn.maxLength}}/>`;
  }
  else if (/^InputNumber$/i.test($uiColumn.controls)) {
    controls = `<InputNumber allowClear min={${$uiColumn.min}} max={${$uiColumn.max}} precision={${$uiColumn.precision}} />`;
  }
  else if (/^DatePicker$/i.test($uiColumn.controls)) {
    controls = `<DatePicker />`;
  }
  else if (/^Select$/i.test($uiColumn.controls)) {
    controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${pluralize(getForeignPropertyName(columnName))} && ${pluralize(getForeignPropertyName(columnName))}.map((${$uiColumn.dataSource}) => (<Select.Option key={${$uiColumn.value}} value={${$uiColumn.value}}>{${$uiColumn.label}}</Select.Option>))}</Select>`;
  }

  return new Handlebars.SafeString(controls);
};

/**
 * This function will be used in UI tier.
 */
const getForeignFieldName = (ref) => {
  return tokenizeReference(ref)[2];
};

module.exports = {
  getControlsNamedImports,
  getQueryFormControls,
  getForeignFieldName,
};