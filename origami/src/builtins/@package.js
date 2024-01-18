import { Tree, keysFromPath } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import project from "./@project.js";

/**
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {string[]} packageKeys
 */
export default async function packageBuiltin(...packageKeys) {
  let scope = this;
  if (!scope) {
    const projectRoot = await project.call(null);
    scope = Scope.getScope(projectRoot);
  }

  const packageRoot = await Tree.traverse(
    // @ts-ignore
    scope,
    "node_modules",
    ...packageKeys
  );
  if (!packageRoot) {
    throw new Error(`Can't find node_modules/${packageKeys.join("/")}`);
  }

  const mainPath = await Tree.traverse(packageRoot, "package.json", "main");
  if (!mainPath) {
    throw new Error(
      `node_modules/${packageKeys.join(
        "/"
      )} doesn't contain a package.json with a "main" entry.`
    );
  }

  const mainKeys = keysFromPath(mainPath);
  const mainContainerKeys = mainKeys.slice(0, -1);
  const mainFileName = mainKeys[mainKeys.length - 1];
  const mainContainer = await Tree.traverse(packageRoot, ...mainContainerKeys);
  const packageExports = await mainContainer.import(mainFileName);
  return packageExports;
}
