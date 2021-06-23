import path from "path";
import process from "process";

export default async function resolvePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

resolvePath.usage = `resolvePath(path)\tResolve the path relative to the current directory`;
