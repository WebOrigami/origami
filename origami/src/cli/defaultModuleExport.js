import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export default async function defaultModuleExport(...keys) {
  // On Windows, absolute paths must be valid file:// URLs.
  const modulePath = path.resolve(process.cwd(), ...keys);
  const url = pathToFileURL(modulePath);
  const module = await import(url.href);
  const result = module.default;
  if (!result) {
    console.error(`${modulePath} does not define a default export.`);
    return;
  }
  return result;
}
