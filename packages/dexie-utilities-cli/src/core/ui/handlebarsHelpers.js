const Handlebars = require("handlebars");
const { tokenizeReference, cvtObj2ReactPropsString } = require("../utils.js");
const { pluralize, getForeignPropertyName, isNilorEmpty } = require("../commonHandlebarsHelpers.js");
const { isEmpty, isString } = require("lodash");

const parseDayjsFormat = (format) => /^(YYYY)(?:[-/]?(MM)(?:[-/]?(DD)\s*(?:(HH)(?::?(mm)(?::?(ss))?)?)?)?)?$/.exec(format);

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
const getFormControls = (columnName, $uiColumn, isQueryForm) => {
  let controls = "";
  if (/^Input(\.[^.]+)?$/i.test($uiColumn.controls.type)) {
    const {type, package, ...props} = $uiColumn.controls;
    if (!("allowClear" in props)) {
      props.allowClear = true;
    }

    if (/^Input\.TextArea$/i.test($uiColumn.controls.type)) {
      if (!("showCount" in props)) {
        props.showCount = true;
      }
    }

    controls = `<${type} ${cvtObj2ReactPropsString(props)}/>`;
  }
  else if (/^InputNumber$/i.test($uiColumn.controls.type)) {
    const {type, package, ...props} = $uiColumn.controls;
    if (isEmpty(props)) {
      controls = `<InputNumber rootClassName="!w-full"/>`;
    }
    else {
      controls = `<InputNumber rootClassName="!w-full" ${cvtObj2ReactPropsString(props)}/>`;
    }
  }
  else if (/^date$/i.test($uiColumn.type)) {
    const match = parseDayjsFormat($uiColumn.controls.format);
    const showTime = !!match && !!match[4];

    if (isQueryForm === true) {
      controls = `<DatePicker.RangePicker className='!w-full' format={"${$uiColumn.controls.format}"} showTime={${showTime}}/>`;
    }
    else {
      controls = `<DatePicker className='!w-full' format={"${$uiColumn.controls.format}"} showTime={${showTime}}/>`;
    }
  }
  else if (/^Select$/i.test($uiColumn.controls.type)) {
    controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${pluralize(getForeignPropertyName(columnName))} && ${pluralize(getForeignPropertyName(columnName))}.map((${$uiColumn.controls.dataSource}) => (<Select.Option key={${$uiColumn.controls.value}} value={${$uiColumn.controls.value}}>{${$uiColumn.controls.label}}</Select.Option>))}</Select>`;
  }
  else {
    const {type, package, ...props} = $uiColumn.controls;
    if (isEmpty(props)) {
      controls = `<${type}/>`;
    }
    else {
      controls = `<${type} ${cvtObj2ReactPropsString(props)}/>`;
    }
  }

  return new Handlebars.SafeString(controls);
};

const isAvailableQueryFormControls = (controls) => {
  const type = isString(controls) ? controls : controls && controls.type;

  if (isNilorEmpty(type) || /^\s*$/.test(type)) {
    return false;
  }
  else if (/^(Input|Select|DatePicker)$/i.test(type)) {
    return true;
  }
  else {
    return false;
  }
};

const isAvailableExportTableColumnControls = (controls) => {
  const type = isString(controls) ? controls : controls && controls.type;
  if (isNilorEmpty(type) || /^\s*$/.test(type)) {
    return false;
  }
  else if (/^(Input|Input\.TextArea|Select|DatePicker)$/i.test(type)) {
    return true;
  }
  else {
    return false;
  }
}

const isAvailableImportTableColumnControls = (controls) => {
  const type = isString(controls) ? controls : controls && controls.type;
  if (isNilorEmpty(type) || /^\s*$/.test(type)) {
    return false;
  }
  else if (/^(Input|Input\.TextArea|DatePicker)$/i.test(type)) {
    return true;
  }
  else {
    return false;
  }
}

const isAvailableTableColumnControls = (controls) => {
  const type = isString(controls) ? controls : controls && controls.type;
  if (isNilorEmpty(type) || /^\s*$/.test(type)) {
    return false;
  }
  else if (/^(Input|Input\.TextArea|Picture.*|Select|DatePicker)$/i.test(type)) {
    return true;
  }
  else {
    return false;
  }
}

const getFormItemClassName = (defaultClassName, controls) => {
  if (/^(Input\.TextArea|Picture.*)$/i.test(controls.type)) {
    return "basis-full";
  }
  else {
    return defaultClassName;
  }
};

const isDate = (type) => {
  return /^date(time)?$/i.test(type);
}

/**
 * This function will be used in UI tier.
 */
const getForeignFieldName = (ref) => {
  return tokenizeReference(ref)[2];
};

const isImage = (controls) => {
  const type = controls && controls.type || "";
  return /^picture/i.test(type);
};

module.exports = {
  getAntdControlsNamedImports,
  getAdditionalPackageControlsNamedImports,
  getFormControls,
  getForeignFieldName,
  isAvailableQueryFormControls,
  isAvailableTableColumnControls,
  isAvailableExportTableColumnControls,
  isAvailableImportTableColumnControls,
  getFormItemClassName,
  isImage,
  isDate,
};