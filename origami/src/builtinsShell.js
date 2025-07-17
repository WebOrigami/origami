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
      "dev:": dev,
      "image:": image,
      "js:": jsGlobals,
      "new:": instantiate,
      "origami:": origami,
      "scope:": scope,
      "site:": adjustReservedWords(site),
      "text:": text,
      "tree:": tree,

      // For backward compat, include all methods at the top level
      ...dev,
      ...image,
      ...origami,
      ...adjustReservedWords(site),
      ...text,
      ...tree,
    };
  }

  return builtins;
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
