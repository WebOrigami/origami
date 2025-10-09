import { FileTree, toString } from "@weborigami/async-tree";
import oriHandler from "../handlers/ori.handler.js";
import coreGlobals from "./coreGlobals.js";
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
      // Config uses only core globals (we're defining the config)
      const globals = await coreGlobals();
      // Evaluate the config file to obtain the configuration object
      configObject = oriHandler.unpack(configText, {
        globals,
        parent: root,
      });
    }
  }

  mapPathToConfig.set(dir, configObject);
  return configObject;
}
