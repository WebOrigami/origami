import { Tree } from "@weborigami/async-tree";
import { builtins } from "@weborigami/language";
import * as dev from "./dev/dev.js";
import help from "./dev/help.js";
import * as origami from "./origami/origami.js";
import explore from "./protocols/explore.js";
import files from "./protocols/files.js";
import http from "./protocols/http.js";
import https from "./protocols/https.js";
import httpstree from "./protocols/httpstree.js";
import httptree from "./protocols/httptree.js";
import node from "./protocols/node.js";
import packageNamespace from "./protocols/package.js";

let initialized = false;

/**
 * Pass the Origami builtins to the compiler.
 */
export default function initializeBuiltins() {
  if (!initialized) {
    const Protocol = {
      explore,
      files,
      http,
      https,
      httpstree,
      httptree,
      node,
      package: packageNamespace,
    };

    const origamiBuiltins = {
      "explore:": explore,
      "files:": files,
      "help:": help,
      "http:": http,
      "https:": https,
      "httpstree:": httpstree,
      "httptree:": httptree,
      "node:": node,
      "package:": packageNamespace,

      Dev: dev,
      Tree,
      Origami: origami,
      Protocol,
    };

    Object.assign(builtins, origamiBuiltins);
  }

  initialized = true;
}
