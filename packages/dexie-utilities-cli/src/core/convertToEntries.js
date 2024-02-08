function convertToEntries(metadata) {
  const tableEntities = [];
  const tableNames = Object.keys(metadata);
  for (const tableName of tableNames) {
    const fieldEntities = [];
    let foreigns = [];
    let many = [];
    const fields = metadata[tableName];
    const fieldNames = Object.keys(fields);
    for (const fieldName of fieldNames) {
      if (fieldName === "$foreigns") {
        foreigns = fields[fieldName];
      }
      else if (fieldName === "$many") {
        many = fields[fieldName];
      } else {
        fieldEntities.push([fieldName, fields[fieldName]]);
      }
    }
    tableEntities.push([tableName, fieldEntities, foreigns, many]);
  }

  return tableEntities;
}

module.exports = {
  convertToEntries
};