import { Tree } from "@weborigami/async-tree";
import { attachWarning } from "@weborigami/language";
import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
import inherited from "./protocols/inherited.js";
import js from "./protocols/js.js";
import instantiate from "./protocols/new.js";
import scope from "./protocols/scope.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

let builtins;

export default function builtinsProgram() {
  if (!builtins) {
    builtins = {
      // All JSE builtins
      ...builtinsJse(),

      // // Old protocols to be deprecated
      "dev:": deprecateFunctions(dev, "dev:", "Dev."),
      "image:": deprecateFunctions(image, "image:", "Origami.image."),
      "inherited:": inherited,
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

      // // For backward compat, include all methods at the top level
      ...deprecateFunctions(dev, "", "Dev."),
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
    const wrappedFn = async function (...args) {
      const oldKey = key === "indent" ? key : `${oldPrefix}${key}()`;
      const newKey =
        key === "indent" ? `${newPrefix}${key}` : `${newPrefix}${key}()`;
      const result =
        value instanceof Function
          ? await value.apply(this, args)
          : await Tree.traverseOrThrow.call(this, value, ...args);
      return attachWarning(
        result,
        `${oldKey} is deprecated, use ${newKey} instead.`
      );
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
