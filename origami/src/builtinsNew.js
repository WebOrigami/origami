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
  json: origami.json,
};

const Origami = {
  ...dev,
  ...origami,
  ...site,
  ...text,
};

/** @type {any} */
export default {
  "explore:": explore,
  "files:": files,
  "help:": help,
  "http:": http,
  "https:": https,
  "httpstree:": httpstree,
  "httptree:": httptree,
  "inherited:": inherited,
  "new:": instantiate,
  "node:": node,
  "package:": packageNamespace,
  "scope:": scope,

  ...js,

  Tree,
  Origami,
  Image: image,

  // Some builtins need to be exposed at top level
  ...handlers.default,
};
