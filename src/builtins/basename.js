import path from "path";

export default function basename(filePath, extension) {
  return path.basename(filePath, extension);
}

basename.usage = `basename path, [extension]\tReturns the base part of a filename`;
basename.documentation =
  "https://explorablegraph.org/cli/builtins.html#basename";
