import ExplorableObject from "../core/ExplorableObject.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
import FormulasMixin from "./FormulasMixin.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default new (FormulasMixin(ExplorableObject))({
  ".index = this()": defaultIndexHtml,
  ".keys.json = this()": defaultKeysJson,
  "index.html = this()": defaultIndexHtml,
});
