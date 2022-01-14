import { stdout } from "process";
import yaml from "./yaml.js";

export default async function stdoutCommand(obj) {
  const output =
    typeof obj === "string" || obj instanceof Buffer
      ? obj
      : obj !== undefined
      ? await yaml(obj)
      : undefined;
  if (output !== undefined) {
    stdout.write(output);
    if (typeof output === "string" && !output.endsWith("\n")) {
      stdout.write("\n");
    }
  }
}

stdoutCommand.usage = "stdout(obj)\tWrite obj to the standard output stream";
