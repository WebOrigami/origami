import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import { isFormulasTransformApplied } from "../framework/FormulasTransform.js";
import MetaTransform from "../framework/MetaTransform.js";

/**
 * Load a file as a YAML/JSON metagraph.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {Explorable}
 */
export default function loadMeta(buffer, key) {
  const text = String(buffer);
  const textWithGraph = new String(text);
  const scope = this;

  let meta;
  /** @type {any} */ (textWithGraph).toGraph = () => {
    if (!meta) {
      const graph = ExplorableGraph.fromYaml(text);
      meta = isFormulasTransformApplied(graph)
        ? graph
        : transformObject(MetaTransform, graph);
      meta.parent = scope;
    }
    return meta;
  };

  return textWithGraph;
}
