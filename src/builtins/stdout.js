import { stdout } from "node:process";
import { stringLike } from "../core/utilities.js";
import yaml from "./yaml.js";

export default async function stdoutCommand(obj) {
  const output = stringLike(obj)
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

stdoutCommand.usage = "stdout <obj>\tWrite obj to the standard output stream";
stdoutCommand.documentation =
  "https://explorablegraph.org/cli/builtins.html#stdout";
