import FileLoadersTransform from "../common/FileLoadersTransform.js";
import InheritScopeMixin from "./InheritScopeMixin.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Constructor<AsyncTree>} AsyncTreeConstructor
 * @param {AsyncTreeConstructor} Base
 */
export default function OrigamiTransform(Base) {
  return class Origami extends InheritScopeMixin(FileLoadersTransform(Base)) {};
}
