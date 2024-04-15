import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import InheritScopeMixin from "./InheritScopeMixin.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function OrigamiTransform(Base) {
  return class Origami extends InheritScopeMixin(
    HandleExtensionsTransform(Base)
  ) {};
}
