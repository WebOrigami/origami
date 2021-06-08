import json from "./json.js";

export default async function stdout(obj) {
  const output = await json(obj);
  console.log(output);
}

stdout.usage = "stdout(obj)\tWrite obj to the standard output stream";
