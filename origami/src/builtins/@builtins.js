import { ObjectTree } from "@weborigami/async-tree";
import * as deprecate from "../common/deprecate.js";
import * as calc from "./calc.js";
import * as dev from "./dev.js";
import * as files from "./files.js";
import * as handlers from "./handlers.js";
import * as image from "./image.js";
import * as js from "./js.js";
import * as node from "./node.js";
import * as origami from "./origami.js";
import * as site from "./site.js";
import * as text from "./text.js";
import * as tree from "./tree.js";

export default new ObjectTree({
  ...calc.default,
  calc: calc.default,
  ...dev.default,
  dev: dev.default,
  "@files": deprecate.command("files:", "@files", files.default),
  ...files.default,
  files: files.default,
  ...image.default,
  image: image.default,
  ...handlers.default,
  handlers: handlers.default,
  ...js.default,
  js: js.default,
  ...node.default,
  "@node": deprecate.command("node:", "@node", node.default),
  node: node.default,
  ...origami.default,
  origami: origami.default,
  ...site.default,
  site: site.default,
  ...text.default,
  text: text.default,
  ...tree.default,
  tree: tree.default,
});
