import { ObjectTree } from "@weborigami/async-tree";
import calc from "../calc/calc.js";
import * as handlers from "../handlers/handlers.js";
import deprecated from "./deprecated.js";
import * as dev from "./dev.js";
import explore from "./explore.js";
import files from "./files.js";
import http from "./http.js";
import https from "./https.js";
import * as image from "./image.js";
import * as js from "./js.js";
import instantiate from "./new.js";
import * as node from "./node.js";
import * as origami from "./origami.js";
import packageNamespace from "./package.js";
import * as site from "./site.js";
import * as text from "./text.js";
import * as tree from "./tree.js";
import treehttp from "./treehttp.js";
import treehttps from "./treehttps.js";

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
  // Handlers need to be exposed at top level
  ...handlers.default,
  ...deprecated,
});
