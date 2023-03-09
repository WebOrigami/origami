import ExplorableGraph from "../core/ExplorableGraph.js";
import {
  isPlainObject,
  isTransformApplied,
  transformObject,
} from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import OriCommandTransform from "../framework/OriCommandTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Add debugging features to the indicated graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function debug(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return;
  }
  const graph = ExplorableGraph.from(variant);
  const result = transformObject(DebugTransform, graph);
  return result;
}

function DebugTransform(Base) {
  return class Debug extends OriCommandTransform(Base) {
    async get(key) {
      let value = await super.get(key);

      // Since this transform is for diagnostic purposes, cast arrays
      // or plain objects to graphs so we can debug them too.
      if (value instanceof Array || isPlainObject(value)) {
        value = ExplorableGraph.from(value);
      }

      const parent = this;

      // Ensure debug transforms are applied to explorable results.
      if (ExplorableGraph.isExplorable(value)) {
        if (!isTransformApplied(InheritScopeTransform, value)) {
          value = transformObject(InheritScopeTransform, value);
        }
        value.parent = parent;

        if (!isTransformApplied(DebugTransform, value)) {
          value = transformObject(DebugTransform, value);
        }
      }

      if (value?.defaults) {
        Object.assign(value.defaults, this.defaults);
      }

      if (value?.toGraph) {
        // If the value isn't a graph, but has a graph attached via a `toGraph`
        // method, wrap the toGraph method to provide debug support for it.
        const original = value.toGraph.bind(value);
        value.toGraph = () => {
          let graph = original();
          graph = transformObject(InheritScopeTransform, graph);
          graph = transformObject(DebugTransform, graph);
          graph.parent = parent;
          return graph;
        };
      }

      return value;
    }
  };
}

debug.usage = `defaultPages <graph>\tAdd default pages like index.html to the graph`;
debug.documentation = "https://graphorigami.org/cli/builtins.html#defaultPages";
