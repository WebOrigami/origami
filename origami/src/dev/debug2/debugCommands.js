// Subset of commands made available via debugTransform

import { Tree } from "@weborigami/async-tree";

import index from "../../origami/indexPage.js";
import yaml from "../../origami/yaml.js";
import explore from "../explore.js";
import svg from "../svg.js";
import version from "../version.js";
import oriEval from "./oriEval.js";

export default function debugCommands(enableUnsafeEval = false) {
  return Object.assign(
    {
      keys: Tree.keys,
      json: Tree.json,
      index,
      yaml,
      explore,
      svg,
      version,
    },
    enableUnsafeEval
      ? {
          eval: oriEval,
        }
      : {},
  );
}
