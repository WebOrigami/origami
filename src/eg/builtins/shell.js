import { exec as callbackExec } from "child_process";
import util from "util";
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

shell.usage = `shell <command>\tExecutes the shell command and returns the output`;
shell.documentation = "https://explorablegraph.org/pika/builtins.html#shell";
