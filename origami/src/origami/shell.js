import { exec as callbackExec } from "node:child_process";
import util from "node:util";
import helpRegistry from "../common/helpRegistry.js";
const exec = util.promisify(callbackExec);

export default async function shell(command) {
  try {
    const { stdout } = await exec(command);
    return stdout;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

helpRegistry.set(
  "origami:shell",
  "(text) - Run the text as a shell command, return the output"
);
