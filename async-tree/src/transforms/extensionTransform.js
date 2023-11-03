import createExtensionKeyFns from "./createExtensionKeyFns.js";
import mapTransform from "./mapTransform.js";

/**
 * Map a tree based on the extensions of its keys.
 *
 * @typedef {(innerValue: any, innerKey?: any) => any} MapFn
 * @param {{ deep?: boolean, description?: string, extension?: string, innerExtension: string, valueFn?: MapFn }} options
 * @returns
 */
export default function createExtensionTransform({
  deep = false,
  description = "extension transform",
  extension,
  innerExtension,
  valueFn,
}) {
  /**
   * @type {import("../../index.ts").TreeTransform}
   */
  return function extensionTransform(tree) {
    const { innerKeyFn, keyFn } = createExtensionKeyFns({
      deep,
      extension,
      innerExtension,
      tree,
    });

    const transform = mapTransform({
      deep,
      description,
      innerKeyFn,
      keyFn,
      valueFn,
    });

    return transform(tree);
  };
}
