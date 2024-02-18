function tokenizeReference(ref) {
  let [tableName, condition, fieldName] = ref.split(".");
  if (fieldName === undefined) {
    fieldName = condition;
    condition = "";
  }

  return [tableName, condition, fieldName];
}

module.exports = {
  tokenizeReference
};