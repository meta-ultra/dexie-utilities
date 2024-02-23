const { get, map, first, uniq, concat, groupBy, identity } = require("lodash");
const Handlebars = require("handlebars");

const rateColumnPriority = (column) => {
  return column[1].required ? 2 : column[1]["schema"] === "++" ? 1 : 0;
};
/**
 * Convert $dexie from object to array of entries and the required properties line in the most front, 
 * and primary key follow ups, then the rest optional keys at the end.
 */
const sortByRequiredFirst = ($dexie) => {
  return Object.entries($dexie).sort((a, b) => rateColumnPriority(a) - rateColumnPriority(b) > 0 ? -1 : 1);
};

/**
 * Retrieve the table names for the foreign keys from the one side.
 */
const getDexieForeignTableNames = ($dexieForeigns) => {
  return map($dexieForeigns, (item) => get(item, "1.foreignTableName"));
};

/**
 * Retrieve the table names for the foreign keys from the many side.
 * Note that, the table name will be ignored when it exists multiple times.
 */
const getDexieManyTableNames = ($dexieMany) => {
  const tableNames = [];
  for (let i = 0; i < $dexieMany.length; i++) {
    const tableName = get($dexieMany[i], "1.manyTableName");
    tableNames.push(tableName);
  }
  const result = Object.values(groupBy(tableNames, identity))
  .filter((tableNames) => tableNames.length === 1)
  .map(first);

  return result;
};
/**
 * Returns the dudeplicated foreign table names for named import statement.
 */
const getDexieForeignManyTableNames = ($dexieForeigns, $dexieMany) => {
  const dexieForeignTableNames = getDexieForeignTableNames($dexieForeigns);
  const dexieManyTableNames = getDexieManyTableNames($dexieMany);
  
  return uniq(concat(dexieForeignTableNames, dexieManyTableNames));
};

/**
 * Get the available many to build many properties inside the foreign entity.
 */
const filterDexieMany = ($dexieMany) => {
  const dexieManyTableNames = getDexieManyTableNames($dexieMany);
  return $dexieMany.filter((item) => {
    return dexieManyTableNames.indexOf(item[1].manyTableName) !== -1;
  });
}

/**
 * Get Dexie schema string. 
 * Note that, the primary key must line at the first.
 */
const getDexieSchema = ($dexie) => {
  let result = "";
  const fields = Object.entries($dexie);
  if (fields.length) {
    let schema = fields.reduce((schema, field) => {
      const fieldOpts = field[1];
      if (!!fieldOpts["indexed"]) {
        const fieldName = field[0];
        schema.push(`${fieldOpts["schema"] || ""}${fieldName}`);
      }

      return schema;
    }, []);
    schema = schema.sort((a,b)=>{
      const aScore = a.startsWith("++") ? 0 : 1; 
      const bScore = b.startsWith("++") ? 0 :1; 
      return aScore - bScore > 0 ? 1 : -1;
    })
    result = schema.join(", ");
  }

  return new Handlebars.SafeString(result);
}

/**
 * Get the data type of the primary key.
 */
const getDexiePrimaryKeyType = ($dexie) => {
  const fields = Object.entries($dexie);
  if (fields && fields.length) {
    const keyField = fields.find((field) => field[1] && field[1]["schema"] === "++");
    return keyField[1].type;
  }
  else {
    return "any";
  }
}

module.exports = {
  sortByRequiredFirst,
  getDexieForeignManyTableNames,
  getDexieSchema,
  getDexiePrimaryKeyType,
  filterDexieMany,
}; 