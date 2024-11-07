import { exec as callbackExec } from "node:child_process";
import util from "node:util";
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
shell.description =
  "shell(text) - Run the text as a shell command, return the output";
