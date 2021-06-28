import yaml from "./yaml.js";

export default async function stdout(obj) {
  const output =
    obj === undefined
      ? "undefined"
      : typeof obj === "string"
      ? obj
      : await yaml(obj);
  console.log(output);
}

stdout.usage = "stdout(obj)\tWrite obj to the standard output stream";
