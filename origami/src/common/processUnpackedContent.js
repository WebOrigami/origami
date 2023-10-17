import { Tree } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import Scope from "./Scope.js";
import { getScope, treeInContext } from "./utilities.js";

/**
 * Perform any necessary post-processing on the unpacked content of a file. This
 * lets treat the contents of various file types consistently.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 *
 * @param {any} content
 * @param {AsyncDictionary|null} parent
 * @param {any} [attachedData]
 * @returns
 */
export default function processUnpackedContent(content, parent, attachedData) {
  if (typeof content === "function") {
    // Wrap the function such to add ambients to the scope.
    const fn = content;
    const parentScope = parent ? getScope(parent) : builtins;
    /** @this {AsyncDictionary|null} */
    async function extendScope(input, ...rest) {
      let attachedTree;
      if (attachedData) {
        const ambientTree = treeInContext({ _: input }, parent);
        attachedTree = treeInContext(attachedData, ambientTree);
      }

      const baseScope = this ?? builtins;
      const extendedScope = new Scope(
        {
          "@container": parent,
          "@local": parentScope,
        },
        attachedTree,
        baseScope
      );

      // return fn.call(extendedScope, input, ...rest);

      // const result1 = await fn.call(extendedScope, input, ...rest);

      let result2;
      // try {
      const extendedScope2 = new Scope(
        {
          "@container": parent,
          "@local": parentScope,
        },
        attachedTree,
        parentScope
      );
      result2 = await fn.call(extendedScope2, input, ...rest);
      return result2;
      //       } catch (e) {
      //         console.warn(e);
      //       }

      //       if (
      //         isStringLike(result1) &&
      //         isStringLike(result2) &&
      //         String(result1) !== String(result2)
      //       ) {
      //         const message = `Function ${format(fn.code)} returned different results
      // #1: ${String(result1)}
      // #2: ${String(result2)}`;
      //         throw new Error(message);
      //       }

      //       return result1;
    }
    extendScope.code = fn.code;
    return extendScope;
  } else if (Tree.isAsyncDictionary(content) && "parent" in content) {
    const result = Object.create(content);
    result.parent = getScope(parent);
    return result;
  } else {
    return content;
  }
}
