import path from "path";
import process from "process";

export default async function defaultModuleExport(relativePath) {
  const resolvedPath = path.resolve(process.cwd(), relativePath);
  let module;
  try {
    module = await import(resolvedPath);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      console.error(`Could not load ${relativePath} as a JavaScript module.`);
      return;
    } else {
      throw error;
    }
  }
  const result = module.default;
  if (!result) {
    console.error(`${relativePath} does not define a default export.`);
    return;
  }
  return result;
}

export async function loadGraphFromModule(modulePath) {
  let fn = null;
  const value = typeof fn === "function" ? fn() : fn;
  return value;
}
