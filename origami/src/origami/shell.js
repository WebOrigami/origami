import { args } from "@weborigami/async-tree";
import { exec as callbackExec } from "node:child_process";
import util from "node:util";
const exec = util.promisify(callbackExec);

/**
 * Return the standard output of invoking the given shell command.
 *
 * @param {string} command
 */
export default async function shell(command) {
  command = args.string(command, "Origami.shell");
  try {
    const { stdout } = await exec(command);
    return stdout;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
