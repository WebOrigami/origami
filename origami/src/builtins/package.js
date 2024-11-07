import { Tree, keysFromPath, scope } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import project from "../origami/project.js";

/**
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {string[]} keys
 */
export default async function packageNamespace(...keys) {
  const parent = this ?? (await project.call(null));
  const parentScope = scope(parent);

  const packageKeys = [keys.shift()];
  if (packageKeys[0]?.startsWith("@")) {
    // First key is an npm organization, get the next key too.
    packageKeys.push(keys.shift());
  }

  const packageRoot = await Tree.traverse(
    // @ts-ignore
    parentScope,
    "node_modules",
    ...packageKeys
  );
  if (!packageRoot) {
    throw new Error(`Can't find node_modules/${packageKeys.join("/")}`);
  }

  const mainPath = await Tree.traverse(packageRoot, "package.json", "main");
  if (!mainPath) {
    throw new Error(
      `node_modules/${keys.join(
        "/"
      )} doesn't contain a package.json with a "main" entry.`
    );
  }

  const mainKeys = keysFromPath(mainPath);
  const mainContainerKeys = mainKeys.slice(0, -1);
  const mainFileName = mainKeys[mainKeys.length - 1];
  const mainContainer = await Tree.traverse(packageRoot, ...mainContainerKeys);
  const packageExports = await mainContainer.import(mainFileName);

  const result =
    keys.length > 0
      ? await Tree.traverse(packageExports, ...keys)
      : packageExports;
  return result;
}

helpRegistry.set(
  "package:",
  "URL protocol for packages installed in node_modules"
);
