const { registerHandlers } = require("./utils.js");
const commonHandlebarsHelpers = require("./commonHandlebarsHelpers.js");
const generateDexieCode = require("./dexie/generateCode.js");
const generateRouteHandlersCode = require("./route-handlers/generateCode.js");
const generateUICode = require("./ui/generateCode.js");

// register commonly-used Handlebars helpers
registerHandlers(commonHandlebarsHelpers);

const generateCode = (metadata, databasePackage) => {
  const dexie = generateDexieCode(metadata);
  const routeHandlers = generateRouteHandlersCode(metadata, databasePackage);
  const ui = generateUICode(metadata);

  return {dexie, routeHandlers, ui};
}

module.exports = generateCode;
