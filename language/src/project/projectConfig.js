import { FileTree, toString } from "@weborigami/async-tree";
import oriHandler from "../handlers/ori.handler.js";
import coreGlobals from "./coreGlobals.js";
import projectRoot from "./projectRoot.js";

const mapPathToConfig = new Map();

export default async function config(dir = process.cwd()) {
  const root = await projectRoot(dir);

  const rootPath = root.path;
  const cached = mapPathToConfig.get(rootPath);
  if (cached) {
    return cached;
  }

  // Use a plain FileTree to avoid loading extension handlers
  const rootFileTree = new FileTree(rootPath);
  const configBuffer = await rootFileTree.get("config.ori");
  let configObject = {};
  if (configBuffer) {
    const configText = toString(configBuffer);
    if (configText) {
      // Config uses only core globals (we're defining the config)
      const globals = await coreGlobals();
      // Evaluate the config file to obtain the configuration object
      configObject = await oriHandler.unpack(configText, {
        globals,
        parent: root,
      });
    }
  }

  mapPathToConfig.set(rootPath, configObject);
  return configObject;
}
