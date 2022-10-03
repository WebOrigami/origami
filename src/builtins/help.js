import child_process from "node:child_process";
import defaultGraph from "./defaultGraph.js";

/**
 * @this {Explorable}
 * @param {string} [name]
 */
export default async function help(name) {
  let url;
  const scope = (await defaultGraph()).scope;
  if (scope && name) {
    const fn = await scope.get(name);
    url = fn?.documentation;
    if (!url) {
      console.error(
        `help: ${name} does not have a property called "documentation" linking to its documentation`
      );
      return;
    }
  } else {
    url = "https://graphorigami.org/cli/";
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
help.documentation = "https://graphorigami.org/cli/builtins.html#help";
