function convertToEntries(metadata) {
  const tableEntities = [];
  const tableNames = Object.keys(metadata);
  for (const tableName of tableNames) {
    const fieldEntities = [];
    let foreigns = metadata[tableName]["$foreigns"] || [];
    let many = metadata[tableName]["$many"] || [];
    const fields = metadata[tableName].fields || {};
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