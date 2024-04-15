/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import child_process from "node:child_process";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

const groupUrls = {
  "@cache": "https://weborigami.org/language/@cache.html",
  "@tree": "https://weborigami.org/language/@tree.html",
  "@image": "https://weborigami.org/language/@image.html",
  "@parse": "https://weborigami.org/language/@parse.html",
  "@scope": "https://weborigami.org/language/@scope.html",
};

/**
 * @this {AsyncTree|null}
 * @param {string} [name]
 */
export default async function help(name) {
  assertScopeIsDefined(this, "help");
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
    url = "https://weborigami.org/cli/";
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
help.documentation = "https://weborigami.org/language/@help.html";
