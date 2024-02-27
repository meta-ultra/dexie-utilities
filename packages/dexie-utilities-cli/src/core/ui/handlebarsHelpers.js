const Handlebars = require("handlebars");
const { tokenizeReference } = require("../utils.js");
const { pluralize, getForeignPropertyName, isNil } = require("../commonHandlebarsHelpers.js");

const getControlsNamedImports = ($ui) => {
  const set = new Set();
  for (const item of Object.values($ui)) {
    if (item.controls) {
      set.add(item.controls.split(".")[0]);
    }
  }
  return Array.from(set).join(", ");
};

/**
 * Get Antd controls according to its controls property.
 */
const getFormControls = (columnName, $uiColumn) => {
  let controls = "";
  if (/^Input(\.[^.]+)?$/i.test($uiColumn.controls)) {
    if (/^Input\.TextArea$/i.test($uiColumn.controls)) {
      controls = `<${$uiColumn.controls} allowClear maxLength={${$uiColumn.maxLength}} showCount/>`;
    }
    else {
      controls = `<${$uiColumn.controls} allowClear maxLength={${$uiColumn.maxLength}}/>`;
    }
  }
  else if (/^InputNumber$/i.test($uiColumn.controls)) {
    controls = `<InputNumber rootClassName="!w-full" min={${$uiColumn.min}} max={${$uiColumn.max}} precision={${$uiColumn.precision}} />`;
  }
  else if (/^DatePicker$/i.test($uiColumn.controls)) {
    controls = `<DatePicker />`;
  }
  else if (/^Select$/i.test($uiColumn.controls)) {
    controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${pluralize(getForeignPropertyName(columnName))} && ${pluralize(getForeignPropertyName(columnName))}.map((${$uiColumn.dataSource}) => (<Select.Option key={${$uiColumn.value}} value={${$uiColumn.value}}>{${$uiColumn.label}}</Select.Option>))}</Select>`;
  }

  return new Handlebars.SafeString(controls);
};

const isAvailableQueryFormControls = (controls) => {
  if (isNil(controls) || /^\s*$/.test(controls)) {
    return false;
  }
  else if (/^Input\.(TextArea|Password)$/i.test(controls)){
    return false;
  }
  else if (/^InputNumber$/i.test(controls)){
    return false;
  }
  else {
    return true;
  }
};

const getColSpan = (controls) => {
  if (/^Input\.TextArea$/i.test(controls)) {
    return 24;
  }
  else {
    return 6;
  }
};

/**
 * This function will be used in UI tier.
 */
const getForeignFieldName = (ref) => {
  return tokenizeReference(ref)[2];
};

module.exports = {
  getControlsNamedImports,
  getFormControls,
  getForeignFieldName,
  isAvailableQueryFormControls,
  getColSpan,
};