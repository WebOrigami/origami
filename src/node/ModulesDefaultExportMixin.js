import path from "path";
import { pathToFileURL } from "url";

export default function ModulesDefaultExportMixin(Base) {
  return class ModulesDefaultExport extends Base {
    // We'd love to be able to defer to the superclass to return the file data and
    // then do a dynamic import from its data. Sadly, the `import()` statement can
    // only work with file paths, not data or streams. So we override asyncGet to
    // do an import instead of a readFile.
    async get(...keys) {
      const lastKey = keys?.[keys.length - 1];
      if (
        lastKey === undefined ||
        (!lastKey.endsWith(".js") && !lastKey.endsWith(".mjs"))
      ) {
        // Not a module; return as is.
        return await super.get(...keys);
      }
      const filePath = path.join(this.dirname, ...keys);
      // On Windows, absolute paths must be valid file:// URLs.
      const fileUrl = pathToFileURL(filePath);
      const obj = await importModule(fileUrl.href);
      return obj?.default;
    }
  };
}

async function importModule(modulePath) {
  let obj;
  try {
    obj = await import(modulePath);
  } catch (/** @type {any} */ error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }
  return obj;
}
