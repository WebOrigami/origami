import path from "path";
import process from "process";
import { pathToFileURL } from "url";

export default async function defaultModuleExport(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  // On Windows, absolute paths must be valid file:// URLs.
  const url = pathToFileURL(resolvedPath);
  const module = await import(url.href);
  const result = module.default;
  if (!result) {
    console.error(`${relativePath} does not define a default export.`);
    return;
  }
  return result;
}

defaultModuleExport.usage = `defaultModuleExport(path)\tThe default export of the module at path`;
