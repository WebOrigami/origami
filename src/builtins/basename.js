import path from "node:path";

export default function basename(filePath, extension) {
  return path.basename(filePath, extension);
}

basename.usage = `basename path, [extension]\tReturns the last file name in a path`;
basename.documentation = "https://graphorigami.org/cli/builtins.html#basename";
