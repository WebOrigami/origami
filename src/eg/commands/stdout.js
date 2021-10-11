import yaml from "./yaml.js";

export default async function stdout(obj) {
  const output =
    typeof obj === "string"
      ? obj
      : obj instanceof Buffer
      ? obj.toString()
      : obj !== undefined
      ? await yaml(obj)
      : undefined;
  if (output !== undefined) {
    console.log(output);
  }
}

stdout.usage = "stdout(obj)\tWrite obj to the standard output stream";
