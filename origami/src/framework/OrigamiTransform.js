import FileLoadersTransform from "../common/FileLoadersTransform.js";
import InheritScopeMixin from "./InheritScopeMixin.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../../index.js").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function OrigamiTransform(Base) {
  return class Origami extends InheritScopeMixin(FileLoadersTransform(Base)) {};
}
