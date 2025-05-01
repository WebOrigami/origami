import * as calc from "./calc/calc.js";
import * as dev from "./dev/dev.js";
import * as handlers from "./handlers/handlers.js";
import help from "./help/help.js";
import * as image from "./image/image.js";
import js from "./js.js";
import node from "./node.js";
import * as origami from "./origami/origami.js";
import explore from "./protocols/explore.js";
import files from "./protocols/files.js";
import http from "./protocols/http.js";
import https from "./protocols/https.js";
import httpstree from "./protocols/httpstree.js";
import httptree from "./protocols/httptree.js";
import inherited from "./protocols/inherited.js";
import instantiate from "./protocols/new.js";
import packageNamespace from "./protocols/package.js";
import scope from "./protocols/scope.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

const Tree = {
  ...tree,
  indent: text.indent,
};

const Origami = {
  ...origami,
  ...site,
  ...text,
};

/** @type {any} */
export default {
  "calc:": adjustReservedWords(calc),
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
  "js:": js,
  "new:": instantiate,
  "node:": node,
  "origami:": origami,
  "package:": packageNamespace,
  "scope:": scope,
  "site:": adjustReservedWords(site),
  "text:": text,
  "tree:": tree,

  // Some builtins need to be exposed at top level
  ...handlers.default,

  Tree,
  Origami,
};

// Handle cases where a builtin name conflicts with a JS reserved word
function adjustReservedWords(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const name = value.key ?? key;
    result[name] = value;
  }
  return result;
}
