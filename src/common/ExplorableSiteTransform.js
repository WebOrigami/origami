import index from "../builtins/index.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { isTransformApplied, transformObject } from "../core/utilities.js";
import defaultKeysJson from "../framework/defaultKeysJson.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Wraps a graph (typically a SiteGraph) to turn a standard site into an
 * explorable site.
 *
 * An explorable site follows three conventions:
 * 1. if route /foo has any resources beneath it (/foo/bar.jpg), then /foo
 *    redirects to /foo/
 * 2. /foo/ is a synonym for foo/index.html
 * 3. /foo/.keys.json returns the public keys below foo/
 *
 * The first convention is handled by the Graph Origami server. This transform
 * handles the second and third conventions.
 *
 * @param {Constructor<Explorable>} Base
 */
export default function ExplorableSiteTransform(Base) {
  return class ExplorableSite extends Base {
    async get(key) {
      // Ask the graph if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The graph doesn't have the key; try the defaults.
        const scope = getScope(this);
        if (key === undefined || key === "index.html") {
          value = await index.call(scope, this);
        } else if (key === ".keys.json") {
          value = await defaultKeysJson.call(scope, this);
        }
      }

      // Ensure this transform is applied to any explorable result. This lets
      // the user browse into data and explorable graphs of types other than the
      // current class.
      if (
        ExplorableGraph.isExplorable(value) &&
        !isTransformApplied(ExplorableSiteTransform, value)
      ) {
        value = transformObject(ExplorableSiteTransform, value);
      }

      return value;
    }
  };
}
