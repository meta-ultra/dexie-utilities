const Handlebars = require("handlebars");
const { tokenizeReference } = require("../utils.js");
const { pluralize, getForeignPropertyName, isNil, isNilorEmpty } = require("../commonHandlebarsHelpers.js");
const { isEmpty } = require("lodash");

const getAntdControlsNamedImports = ($ui) => {
  const set = new Set();
  for (const item of Object.values($ui)) {
    if (item.controls && /^antd$/i.test(item.controls.package)) {
      set.add(item.controls.type.split(".")[0]);
    }
  }
  return Array.from(set).join(", ");
};

const getAdditionalPackageControlsNamedImports = ($ui) => {
  const map = new Map();
  for (const item of Object.values($ui)) {
    if (item.controls && !/^antd$/i.test(item.controls.package)) {
      if (!map.has(item.controls.package)) {
        map.set(item.controls.package, new Set());
      }
      const set = map.get(item.controls.package);
      set.add(item.controls.type.split(".")[0]);
    }
  }

  const result = {};
  for (const [package, namedImportSet] of map.entries()) {
    result[package] = Array.from(namedImportSet).join(", ");
  }

  return result;
};

/**
 * Get Antd controls according to its controls property.
 */
const getFormControls = (columnName, $uiColumn) => {
  let controls = "";
  if (/^Input(\.[^.]+)?$/i.test($uiColumn.controls.type)) {
    const {type, ...props} = $uiColumn.controls;
    if (!("allowClear" in props)) {
      props.allowClear = true;
    }

    if (/^Input\.TextArea$/i.test($uiColumn.controls.type)) {
      if (!("showCount" in props)) {
        props.showCount = true;
      }
    }

    controls = `<${type} {...(${JSON.stringify(props)})}/>`;
  }
  else if (/^InputNumber$/i.test($uiColumn.controls.type)) {
    const {type, ...props} = $uiColumn.controls;
    if (isEmpty(props)) {
      controls = `<InputNumber rootClassName="!w-full"/>`;
    }
    else {
      controls = `<InputNumber rootClassName="!w-full" {...(${JSON.stringify(props)})}/>`;
    }
  }
  else if (/^DatePicker$/i.test($uiColumn.controls.type)) {
    controls = `<DatePicker />`;
  }
  else if (/^Select$/i.test($uiColumn.controls.type)) {
    controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${pluralize(getForeignPropertyName(columnName))} && ${pluralize(getForeignPropertyName(columnName))}.map((${$uiColumn.controls.dataSource}) => (<Select.Option key={${$uiColumn.controls.value}} value={${$uiColumn.controls.value}}>{${$uiColumn.controls.label}}</Select.Option>))}</Select>`;
  }
  else {
    const {type, ...props} = $uiColumn.controls;
    if (isEmpty(props)) {
      controls = `<${type}/>`;
    }
    else {
      controls = `<${type} {...(${JSON.stringify(props)})}/>`;
    }
  }

  return new Handlebars.SafeString(controls);
};

const isAvailableQueryFormControls = (controls) => {
  if (isNil(controls) || isNilorEmpty(controls.type) || /^\s*$/.test(controls.type)) {
    return false;
  }
  else if (/^(Input|Select|DatePicker)$/i.test(controls.type)) {
    return true;
  }
  else {
    return false;
  }
};

const getColSpan = (controls) => {
  if (/^Input\.TextArea$/i.test(controls.type)) {
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
  getAntdControlsNamedImports,
  getAdditionalPackageControlsNamedImports,
  getFormControls,
  getForeignFieldName,
  isAvailableQueryFormControls,
  getColSpan,
};