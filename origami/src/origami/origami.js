import helpRegistry from "../common/helpRegistry.js";

export { default as basename } from "./basename.js";

// Use a dynamic import to avoid circular dependencies
export const builtins = import("../builtins/internal.js").then(
  (internal) => internal.builtins
);

export { default as config } from "./config.js";
export { default as json } from "./json.js";
export { default as jsonParse } from "./jsonParse.js";
export { default as naturalOrder } from "./naturalOrder.js";
export { default as once } from "./once.js";
export { default as ori } from "./ori.js";
export { default as pack } from "./pack.js";
export { default as post } from "./post.js";
export { default as project } from "./project.js";
export { default as regexMatch } from "./regexMatch.js";
export { default as repeat } from "./repeat.js";
export { default as shell } from "./shell.js";
export { default as slash } from "./slash.js";
export { default as stdin } from "./stdin.js";
export { default as string } from "./string.js";
export { default as unpack } from "./unpack.js";
export { default as version } from "./version.js";
export { default as yaml } from "./yaml.js";
export { default as yamlParse } from "./yamlParse.js";

helpRegistry.set(
  "origami:builtins",
  " - The set of installed builtin functions"
);
helpRegistry.set(
  "origami:naturalOrder",
  " - A comparison function for natural sort order"
);
helpRegistry.set(
  "origami:slash",
  " - Helpers for working with trailing slashes"
);
helpRegistry.set("origami:", "Perform general Origami language functions");
