import { pathToFileURL } from "url";

export default async function defaultModuleExport(modulePath) {
  // On Windows, absolute paths must be valid file:// URLs.
  const url = pathToFileURL(modulePath);
  const module = await import(url.href);
  const result = module.default;
  if (!result) {
    console.error(`${modulePath} does not define a default export.`);
    return;
  }
  return result;
}

defaultModuleExport.usage = `defaultModuleExport(path)\tThe default export of the module at path`;
