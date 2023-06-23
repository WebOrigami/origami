import child_process from "node:child_process";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

const groupUrls = {
  "@cache": "https://graphorigami.org/language/@cache.html",
  "@graph": "https://graphorigami.org/language/@graph.html",
  "@image": "https://graphorigami.org/language/@image.html",
  "@map": "https://graphorigami.org/language/@map.html",
  "@parse": "https://graphorigami.org/language/@parse.html",
  "@scope": "https://graphorigami.org/language/@scope.html",
};

/**
 * @this {Explorable|null}
 * @param {string} [name]
 */
export default async function help(name) {
  assertScopeIsDefined(this);
  let url;
  const scope = this;
  if (scope && name) {
    if (groupUrls[name]) {
      url = groupUrls[name];
    } else {
      const fn = await scope.get(name);
      url = fn?.documentation;
    }
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

help.usage = `@help/<name>\tOpens documentation for the named built-in command`;
help.documentation = "https://graphorigami.org/language/@help.html";
