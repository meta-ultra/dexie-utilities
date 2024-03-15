const { registerHandlers } = require("./utils.js");
const commonHandlebarsHelpers = require("./commonHandlebarsHelpers.js");
const generateDexieCode = require("./dexie/generateCode.js");
const generateApiCode = require("./api/generateCode.js");
const generateUICode = require("./ui/generateCode.js");

// register commonly-used Handlebars helpers
registerHandlers(commonHandlebarsHelpers);

const generateCode = (metadata, filteredMetadata, databasePackage) => {
  const dexie = generateDexieCode(metadata);
  const api = generateApiCode(filteredMetadata, databasePackage);
  const ui = generateUICode(filteredMetadata);

  return {dexie, api, ui};
}

module.exports = generateCode;
