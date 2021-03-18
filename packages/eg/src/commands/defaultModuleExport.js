import path from "path";
import process from "process";

export default async function defaultModuleExport(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  const module = await import(resolvedPath);
  const result = module.default;
  if (!result) {
    console.error(`${relativePath} does not define a default export.`);
    return;
  }
  return result;
}

defaultModuleExport.usage = `defaultModuleExport(path)\tThe default export of the module at path`;
