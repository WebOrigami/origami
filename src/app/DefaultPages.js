import DefaultValues from "../common/DefaultValues.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultPages extends DefaultValues {
  constructor(graph) {
    super(graph, {
      ".index": defaultIndexHtml,
      ".keys.json": defaultKeysJson,
      "index.html": defaultIndexHtml,
    });
  }

  onChange(eventType, filename) {
    // @ts-ignore
    this.graph.onChange?.(eventType, filename);
  }

  get path() {
    // @ts-ignore
    return this.graph.path;
  }
}
