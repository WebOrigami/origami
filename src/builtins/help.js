import child_process from "child_process";
import config from "./config.js";

export default async function help(name) {
  let url;
  if (name) {
    const scope = await config();
    const fn = await scope.get(name);
    url = fn?.documentation;
    if (!url) {
      console.error(
        `help: ${name} does not have a property called "documentation" linking to its documentation`
      );
      return;
    }
  } else {
    url = "https://explorablegraph.org/pika";
  }
  const platform = process.platform;
  const start =
    platform === "darwin"
      ? "open"
      : platform === "win32"
      ? "start"
      : "xdg-open";
  const command = `${start} ${url}`;
  child_process.exec(command);
}

help.usage = `help/<name>\tOpens documentation for the named built-in command`;
help.documentation = "https://explorablegraph.org/pika/builtins.html#help";
