import { Tree } from "@weborigami/async-tree";
import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
import js from "./protocols/js.js";
import instantiate from "./protocols/new.js";
import scope from "./protocols/scope.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

let builtins;

export default function builtinsShell() {
  if (!builtins) {
    builtins = {
      // All JSE builtins
      ...builtinsJse(),

      // Old protocols to be deprecated
      "dev:": deprecateFunctions(dev, "dev:", "Origami."),
      "image:": deprecateFunctions(image, "image:", "Origami.image."),
      "js:": js,
      "new:": instantiate,
      "origami:": deprecateFunctions(origami, "origami:", "Origami."),
      "scope:": scope,
      "site:": deprecateFunctions(
        adjustReservedWords(site),
        "site:",
        "Origami."
      ),
      "text:": deprecateFunctions(text, "text:", "Origami."),
      "tree:": deprecateFunctions(tree, "tree:", "Tree."),

      // For backward compat, include all methods at the top level
      ...dev,
      ...deprecateFunctions(image, "", "Origami.image."),
      ...deprecateFunctions(origami, "", "Origami."),
      ...deprecateFunctions(adjustReservedWords(site), "site:", "Origami."),
      ...deprecateFunctions(text, "", "Origami."),
      ...deprecateFunctions(tree, "", "Tree."),
    };
  }

  return builtins;
}

function deprecateFunctions(fns, oldPrefix, newPrefix) {
  const wrappedEntries = Object.entries(fns).map(([key, value]) => {
    const wrappedFn = function (...args) {
      const oldKey = key === "indent" ? key : `${oldPrefix}${key}()`;
      const newKey =
        key === "indent" ? `${newPrefix}${key}` : `${newPrefix}${key}()`;
      console.warn(`Warning: ${oldKey} is deprecated, use ${newKey} instead.`);
      return value instanceof Function
        ? value.apply(this, args)
        : Tree.traverseOrThrow.call(this, value, ...args);
    };
    Object.assign(wrappedFn, value);
    return [key, wrappedFn];
  });
  return Object.fromEntries(wrappedEntries);
}

// Handle cases where a builtin name conflicts with a JS reserved word
function adjustReservedWords(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const name = value.key ?? key;
    result[name] = value;
  }
  return result;
}
