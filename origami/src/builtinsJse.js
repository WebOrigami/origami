import { text as treeText } from "@weborigami/async-tree";
import { jsGlobals } from "@weborigami/language";
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
import node from "./protocols/node.js";
import packageNamespace from "./protocols/package.js";
import scope from "./protocols/scope.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

let builtins;

export default function builtinsJse() {
  if (!builtins) {
    const Tree = {
      ...tree,
      indent: text.indent,
      json: origami.json,
      text: treeText,
    };

    const Origami = {
      ...dev,
      image,
      ...origami,
      ...site,
      ...text,
    };

    /** @type {any} */
    builtins = {
      ...jsGlobals,

      "explore:": explore,
      "files:": files,
      "help:": help,
      "http:": http,
      "https:": https,
      "httpstree:": httpstree,
      "httptree:": httptree,
      "inherited:": inherited,
      "node:": node,
      "package:": packageNamespace,
      "scope:": scope,

      Tree,
      Origami,

      // Handlers need to be exposed at top level
      ...handlerBuiltins(),
    };
  }

  return builtins;
}
