import { ObjectTree } from "@weborigami/async-tree";
import calc from "../calc/calc.js";
import * as dev from "../dev/dev.js";
import * as handlers from "../handlers/handlers.js";
import * as image from "../image/image.js";
import * as origami from "../origami/origami.js";
import * as site from "../site/site.js";
import * as text from "../text/text.js";
import * as tree from "../tree/tree.js";
import deprecated from "./deprecated.js";
import explore from "./explore.js";
import files from "./files.js";
import http from "./http.js";
import https from "./https.js";
import * as js from "./js.js";
import instantiate from "./new.js";
import * as node from "./node.js";
import packageNamespace from "./package.js";
import treehttp from "./treehttp.js";
import treehttps from "./treehttps.js";
// import home from "./~.js";

export default new ObjectTree({
  "calc:": calc,
  "dev:": dev,
  "explore:": explore,
  "files:": files,
  "http:": http,
  "https:": https,
  "image:": image,
  "js:": js.default,
  "new:": instantiate,
  "node:": node.default,
  "origami:": origami.default,
  "package:": packageNamespace,
  "site:": site,
  "text:": text,
  "tree:": tree.default,
  "treehttp:": treehttp,
  "treehttps:": treehttps,

  // Some builtins need to be exposed at top level
  ...handlers.default,
  // "~": home,

  // Deprecated builtins
  ...deprecated,
});
