function convertToEntries(metadata) {
  const tableEntities = [];
  const tableNames = Object.keys(metadata);
  for (const tableName of tableNames) {
    const fieldEntities = [];
    let foreigns = [];
    const fields = metadata[tableName];
    const fieldNames = Object.keys(fields);
    for (const fieldName of fieldNames) {
      if (fieldName === "$foreigns") {
        foreigns = fields[fieldName];
      }
      else {
        fieldEntities.push([fieldName, fields[fieldName]]);
      }
    }
    tableEntities.push([tableName, fieldEntities, foreigns]);
  }

  return tableEntities;
}

module.exports = {
  convertToEntries
};