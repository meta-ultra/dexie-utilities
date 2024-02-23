const { join, dirname } = require("node:path");
const { mkdir, writeFile } = require("node:fs");

async function outputCode(rootPath, generatedCodes) {
  await Promise.all(Object.entries(generatedCodes).map(([path, source]) => {
    return new Promise((resolve, reject) => {
      const fullPath = join(rootPath, path);
      mkdir(dirname(fullPath), { recursive: true }, (err) => {
        if (!err) {
          writeFile(fullPath, source, "utf-8", (err) => {
            if (err) {
              reject(err);
            }
            else {
              resolve();
            }
          });
        }
      });
    })
  }));
}

module.exports = outputCode;