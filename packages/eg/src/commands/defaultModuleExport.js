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

export async function loadGraphFromModule(modulePath) {
  let fn = null;
  const value = typeof fn === "function" ? fn() : fn;
  return value;
}
