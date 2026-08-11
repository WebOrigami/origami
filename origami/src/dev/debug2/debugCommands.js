// Subset of commands made available via debugTransform

import { Tree } from "@weborigami/async-tree";
export const keys = Tree.keys;
export const json = Tree.json;

export { default as index } from "../../origami/indexPage.js";
export { default as yaml } from "../../origami/yaml.js";
export { default as explore } from "../explore.js";
export { default as svg } from "../svg.js";
export { default as syscache } from "../syscache.js";
export { default as version } from "../version.js";

// Someone might accidentally deploy a debug server so we don't give acces to
// eval by default, but it can be useful for debugging Origami.

// export { default as eval } from "./oriEval.js";
