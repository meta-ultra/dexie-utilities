function convertToEntries(metadata) {
  const tableEntities = [];
  const tableNames = Object.keys(metadata);
  for (const tableName of tableNames) {
    const fieldEntities = [];
    const table = metadata[tableName];
    let foreigns = table["$foreigns"] || [];
    let many = table.many !== false && table["$many"] || [];
    const fields = table.fields || {};
    const fieldNames = Object.keys(fields);
    for (const fieldName of fieldNames) {
      fieldEntities.push([fieldName, fields[fieldName]]);
    }
    tableEntities.push([tableName, fieldEntities, foreigns, many]);
  }

  return tableEntities;
}

module.exports = {
  convertToEntries
};