import { ObjectTree } from "@weborigami/async-tree";
import * as calc from "./calc.js";
import deprecated from "./deprecated.js";
import * as dev from "./dev.js";
import explore from "./explore.js";
import * as files from "./files.js";
import * as handlers from "./handlers.js";
import http from "./http.js";
import https from "./https.js";
import * as image from "./image.js";
import * as js from "./js.js";
import instantiate from "./new.js";
import * as node from "./node.js";
import * as origami from "./origami.js";
import * as site from "./site.js";
import * as text from "./text.js";
import * as tree from "./tree.js";
import treehttp from "./treehttp.js";
import treehttps from "./treehttps.js";

export default new ObjectTree({
  "calc:": calc.default,
  "dev:": dev.default,
  "explore:": explore,
  "files:": files.default,
  "http:": http,
  "https:": https,
  "image:": image.default,
  "js:": js.default,
  "new:": instantiate,
  "node:": node.default,
  "origami:": origami.default,
  "site:": site.default,
  "text:": text.default,
  "tree:": tree.default,
  "treehttp:": treehttp,
  "treehttps:": treehttps,
  // Handlers need to be exposed at top level
  ...handlers.default,
  ...deprecated,
});
