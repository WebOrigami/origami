import { Tree } from "@weborigami/async-tree";
import builtins from "./builtins.js";
import jsGlobals from "./jsGlobals.js";
import projectConfig from "./projectConfig.js";

let globals;

export default async function projectGlobals() {
  if (!globals) {
    const handlerGlobals = (await import("../handlers/handlerGlobals.js"))
      .default;
    const config = await projectConfig();
    globals = {
      ...jsGlobals,
      Tree,
      ...handlerGlobals,
      ...builtins,
      ...config,
    };
  }

  return globals;
}
