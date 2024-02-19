function tokenizeReference(ref) {
  let [tableName, condition, fieldName] = ref.split(".");
  if (fieldName === undefined) {
    fieldName = condition;
    condition = "";
  }

  return [tableName, condition, fieldName];
}

function tokenizeName(name) {
  const re = /[A-Z]/;
  const tokens = name.split(/[-_.]/);
  return tokens.reduce((tokens, token) => {
    let match = re.exec(token);
    while (match) {
      const subToken = token.substring(0, match.index).toLowerCase();
      if (subToken) {
        tokens.push(subToken);
      }
      token = token[match.index].toLowerCase() + token.slice(match.index + 1);
      match = re.exec(token);
    }
    if (token) {
      tokens.push(token.toLowerCase());
    }

    return tokens;
  }, []);
}

module.exports = {
  tokenizeReference,
  tokenizeName,
};