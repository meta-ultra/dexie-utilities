const Handlebars = require("handlebars");
const { join, get, isNil, lowerCase, camelCase, upperFirst, capitalize, kebabCase } = require("lodash");
const { tokenizeReference, tokenizeName } = require("../utils.js");

/* Partials on fly */
// Handlebars.registerPartial("staticImports", readTemplateSync("../templates/staticImports.hbs"));
/* End of Partials on fly*/

const registerHandlers = (...fns) => {
  fns.forEach((fn) => {
    if (typeof fn === "function") {
      Handlebars.registerHelper(fn.name, fn);
    }
  });
};

/* Helpers START */
const pluralize = (x) => {
  return /(ch|sh|x|s)$/.test(x) ? x + "es" : x + "s";
};

const isNilorEmpty = (...values) => {
  let result = true;
  for (let i = 0; result && i < values.length; ++i) {
    const value = values[i];
    result = result && (value === undefined || value === null || !value.length);
  }

  return result;
};

const upperCamelCase = (value) => upperFirst(camelCase(value));


const frameYupSchema = (field, strict) => {
  const schema = [`${lowerCase(field.type)}()`];
  if (field.type === "number") {
    // schema for number
    if (/int(eger)?/i.test(field["$original-type"])) {
      schema.push("integer()");
    }

    if (strict === true) {
      if ("min" in field) {
        schema.push(`min(${field.min})`);
      }
      if ("max" in field) {
        schema.push(`max(${field.max})`);
      }
    }
  }

  if (field.type === "string") {
    if (strict === true) {
      if ("format" in field) {
        schema.push(`matches(RegExp("${field.format}"))`);
      }
    }
  }

  if (strict === true && field.required) {
    schema.push("required()");
  }

  return schema.length ? new Handlebars.SafeString(schema.join(".")) : "";
};

const getPrimaryField = (fields) => {
  const field = fields.find((field) => {
    return field[1]["primary-key"] || field[1]["auto-increment"];
  })
  return field;
};

const getTableName = (value) => pluralize(value);

const getIndexes = (fields) => {
  if (fields && fields.length) {
    let indexes = fields.reduce((indexes, field) => {
      const fieldOpts = field[1];
      if (fieldOpts.indexed !== false) {
        const fieldName = field[0];
        indexes.push(`${fieldOpts["auto-increment"] ? "++" : ""}${fieldName}`);
      }

      return indexes;
    }, []);
    indexes = indexes.sort((a,b)=>{
      const aScore = a.startsWith("++") ? 0 : 1; 
      const bScore = b.startsWith("++") ? 0 :1; 
      return aScore - bScore > 0 ? 1 : -1;
    })
    return indexes.join(", ");
  }
  else {
    return "";
  }
}

const getKeyType = (fields) => {
  if (fields && fields.length) {
    const keyField = fields.find((field) => field[1] && field[1]["auto-increment"]);
    return keyField[1].type;
  }
  else {
    return "any";
  }
}

const getFieldScore = (field) => {
  return field[1].required ? 2 : field[1]["auto-increment"] ? 1 : 0
};
const sortByRequiredFirst = (fields) => {
  return fields.sort((a, b) => getFieldScore(a) - getFieldScore(b) > 0 ? -1 : 1);
};
const nameForignField = (fieldName, foreignFieldName) => {
  return camelCase(fieldName.replace(RegExp(foreignFieldName + "$", "i"), ""));
};
const pluralizeLowerCamelCase = (fieldName) => {
  return pluralize(camelCase(fieldName));
};
const pluralizeKebabCase = (fieldName) => {
  return pluralize(kebabCase(fieldName));
};
const getEntityNameOfForeigns = (foreigns, many) => {
  const entityNames = new Set();
  for (const foreign of foreigns) {
    entityNames.add(foreign[1].entityName);
  }
  for (const one of many) {
    entityNames.add(one[1].entityName);
  }

  return Array.from(entityNames);
};
const getQueryFormControls = (entity) => {
  const [entityName, entityCofig] = entity;
  let controls = "";
  if (/^Input$/i.test(entityCofig["$ui"].controls)) {
    controls = `<Input allowClear maxLength={${entityCofig["$ui"].maxLength}}/>`;
  }
  else if (/^InputNumber$/i.test(entityCofig["$ui"].controls)) {
    controls = `<InputNumber allowClear min={${entityCofig["$ui"].min}} max={${entityCofig["$ui"].max}} precision={${entityCofig["$ui"].precision}} />`;
  }
  else if (/^DatePicker$/i.test(entityCofig["$ui"].controls)) {
    controls = `<DatePicker />`;
  }
  else if (/^Select$/i.test(entityCofig["$ui"].controls)) {
    controls = `<Select allowClear showSearch filterOption={(input, option) => !!(option && option.children && option.children.indexOf(input as any) !== -1)}>{${getForeignPropertyName(entityName)} && ${getForeignPropertyName(entityName)}.map((${entityCofig["$ui"].dataSource}) => (<Select.Option key={${entityCofig["$ui"].value}} value={${entityCofig["$ui"].value}}>{${entityCofig["$ui"].label}}</Select.Option>))}</Select>`;
  }

  return new Handlebars.SafeString(controls);
};
const getForeignTableName = (ref) => {
  return tokenizeReference(ref)[0];
};
const getForeignFieldName = (ref) => {
  return tokenizeReference(ref)[2];
};

const getForeignPropertyName = (fieldName) => {
  const tokens = tokenizeName(fieldName);
  if (tokens.length < 2) {
    throw Error(`The foreign field name should be made of two words at least, but "${fieldName}" was found!`);
  }
  tokens.pop();
  return tokens.map((token, i) => i === 0 ? token : capitalize(token)).join("");
};

const getControlsNamedImports = (fields) => {
  const set = fields.reduce((set, field) => {
    if (field[1]["$ui"]["title"]) {
      set.add(field[1]["$ui"]["controls"]);
    }

    return set;
  }, new Set());

  return Array.from(set).join(", ");
};
/* Helpers END */

module.exports = {
  get,
  join,
  isNil,
  lowerCase,
  pluralize, 
  isNilorEmpty,
  upperCamelCase,

  frameYupSchema,
  getPrimaryField,
  getTableName,
  getIndexes,
  getKeyType,
  sortByRequiredFirst,
  nameForignField,
  pluralizeLowerCamelCase,
  pluralizeKebabCase,
  getEntityNameOfForeigns,
  getQueryFormControls,
  getForeignTableName,
  getForeignFieldName,

  getForeignPropertyName, 
  getControlsNamedImports,
},

registerHandlers(...Object.values(module.exports));