import { FileTree, toString, Tree } from "@weborigami/async-tree";
import oriHandler from "../handlers/ori.handler.js";
import protocolGlobals from "../protocols/protocolGlobals.js";
import builtins from "./builtins.js";
import jsGlobals from "./jsGlobals.js";
import projectRoot from "./projectRoot.js";

const mapPathToConfig = new Map();

export default async function config(dir = process.cwd()) {
  const cached = mapPathToConfig.get(dir);
  if (cached) {
    return cached;
  }

  const root = await projectRoot(dir);
  // Use a plain FileTree to avoid loading extension handlers
  const rootFileTree = new FileTree(root.path);
  const configBuffer = await rootFileTree.get("config.ori");
  let configObject = {};
  if (configBuffer) {
    const configText = toString(configBuffer);
    if (configText) {
      // Config gets a reduced set of globals
      const handlerGlobals = (await import("../handlers/handlerGlobals.js"))
        .default;
      const globals = {
        ...jsGlobals,
        Tree,
        ...protocolGlobals,
        ...handlerGlobals,
        ...builtins,
      };
      // Evaluate the config file to obtain the configuration object
      configObject = oriHandler.unpack(configText, { globals });
    }
  }

  mapPathToConfig.set(dir, configObject);
  return configObject;
}
