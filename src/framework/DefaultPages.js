import DefaultValues from "../common/DefaultValues.js";
import defaultDataflow from "./defaultDataflow.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";
import defaultScope from "./defaultScope.js";
import defaultSvg from "./defaultSvg.js";
import defaultYamlHtml from "./defaultYamlHtml.js";
import scopeExplorer from "./scopeExplorer.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultPages extends DefaultValues {
  constructor(graph) {
    super(graph, {
      ".dataflow": defaultDataflow,
      ".explore": scopeExplorer,
      ".index": async () =>
        defaultIndexHtml.call(this, { showDiagnostics: true }),
      ".keys.json": defaultKeysJson,
      ".scope": defaultScope,
      ".svg": defaultSvg,
      ".yaml": defaultYamlHtml,
      "index.html": defaultIndexHtml,
    });
  }

  get path() {
    return /** @type {any} */ (this.graph).path;
  }
}
