import { jsGlobals } from "@weborigami/language";
import builtinsJse from "./builtinsJse.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
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
      "dev:": deprecationWarnings(dev, "dev:", "Origami."),
      "image:": deprecationWarnings(image, "image:", "Origami.image."),
      "js:": deprecationWarnings(jsGlobals, "js:", ""),
      "new:": deprecationWarnings(instantiate, "new:", "new"),
      "origami:": deprecationWarnings(origami, "origami:", "Origami."),
      "scope:": deprecationWarnings(scope, "scope:", "Origami."),
      "site:": deprecationWarnings(
        adjustReservedWords(site),
        "site:",
        "Origami."
      ),
      "text:": deprecationWarnings(text, "text:", "Origami."),
      "tree:": deprecationWarnings(tree, "tree:", "Tree."),

      // For backward compat, include all methods at the top level
      ...dev,
      ...deprecationWarnings(image, "", "Origami.image."),
      ...deprecationWarnings(origami, "", "Origami."),
      ...deprecationWarnings(adjustReservedWords(site), "site:", "Origami."),
      ...deprecationWarnings(text, "", "Origami."),
      ...deprecationWarnings(tree, "", "Tree."),
    };
  }

  return builtins;
}

function deprecationWarnings(fns, oldPrefix, newPrefix) {
  const wrappedEntries = Object.entries(fns).map(([key, value]) => [
    key,
    function (...args) {
      const oldKey = key === "indent" ? key : `${oldPrefix}${key}()`;
      const newKey =
        key === "indent" ? `${newPrefix}${key}` : `${newPrefix}${key}()`;
      console.warn(`Warning: ${oldKey} is deprecated, use ${newKey} instead.`);
      return value.apply(this, args);
    },
  ]);
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
