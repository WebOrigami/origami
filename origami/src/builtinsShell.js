import { jsGlobals } from "@weborigami/language";
import BuiltinsTree from "./BuiltinsTree.js";
import * as dev from "./dev/dev.js";
import handlerBuiltins from "./handlers/handlerBuiltins.js";
import help from "./help/help.js";
import * as image from "./image/image.js";
import * as origami from "./origami/origami.js";
import explore from "./protocols/explore.js";
import files from "./protocols/files.js";
import http from "./protocols/http.js";
import https from "./protocols/https.js";
import httpstree from "./protocols/httpstree.js";
import httptree from "./protocols/httptree.js";
import inherited from "./protocols/inherited.js";
import instantiate from "./protocols/new.js";
import node from "./protocols/node.js";
import packageNamespace from "./protocols/package.js";
import scope from "./protocols/scope.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

let result;

export default function builtinsShell() {
  if (!result) {
    const builtins = {
      "dev:": dev,
      "explore:": explore,
      "files:": files,
      "help:": help,
      "http:": http,
      "https:": https,
      "httpstree:": httpstree,
      "httptree:": httptree,
      "image:": image,
      "inherited:": inherited,
      "js:": jsGlobals,
      "new:": instantiate,
      "node:": node,
      "origami:": origami,
      "package:": packageNamespace,
      "scope:": scope,
      "site:": adjustReservedWords(site),
      "text:": text,
      "tree:": tree,

      // Handlers need to be exposed at top level
      ...handlerBuiltins(),
    };

    // For all builtins like `tree:keys`, add a shorthand `keys`.
    for (const [key, value] of Object.entries(builtins)) {
      const isNamespace = key.endsWith(":");
      if (isNamespace) {
        for (const [subKey, subValue] of Object.entries(value)) {
          // HACK: Skip description keys until we can make them all non-enumerable.
          if (subKey === "description") {
            continue;
          }
          if (subKey in builtins) {
            throw new Error(`Internal Origami error: Duplicate key: ${subKey}`);
          }
          builtins[subKey] = subValue;
        }
      }
    }

    result = new BuiltinsTree(builtins);
  }

  return result;
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
