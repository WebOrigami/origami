/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */

import { Dictionary, Graph } from "@graphorigami/core";
import ExplorableSiteTransform from "../common/ExplorableSiteTransform.js";
import {
  isPlainObject,
  isTransformApplied,
  transformObject,
} from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import OriCommandTransform from "../framework/OriCommandTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Add debugging features to the indicated graph.
 *
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function debug(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return;
  }

  /** @type {any} */
  let graph = Graph.from(graphable);

  if (!isTransformApplied(ExplorableSiteTransform, graph)) {
    graph = transformObject(ExplorableSiteTransform, graph);
  }

  // Apply InheritScopeTransform to the graph if it doesn't have a scope yet so
  // that we can view scope when debugging values inside it.
  if (!graph.scope) {
    if (!isTransformApplied(InheritScopeTransform, graph)) {
      graph = transformObject(InheritScopeTransform, graph);
    }
    graph.parent = this;
  }

  graph = transformObject(DebugTransform, graph);
  return graph;
}

/**
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
function DebugTransform(Base) {
  return class Debug extends OriCommandTransform(Base) {
    async get(key) {
      let value = await super.get(key);

      // Since this transform is for diagnostic purposes, cast arrays
      // or plain objects to graphs so we can debug them too.
      if (value instanceof Array || isPlainObject(value)) {
        value = Graph.from(value);
      }

      const parent = this;

      // Ensure debug transforms are applied to explorable results.
      if (Dictionary.isAsyncDictionary(value)) {
        if (!isTransformApplied(ExplorableSiteTransform, value)) {
          value = transformObject(ExplorableSiteTransform, value);
        }

        if (!isTransformApplied(InheritScopeTransform, value)) {
          value = transformObject(InheritScopeTransform, value);
        }
        value.parent = parent;

        if (!isTransformApplied(DebugTransform, value)) {
          value = transformObject(DebugTransform, value);
        }
      }

      if (value?.unpack) {
        // If the value isn't a graph, but has a graph attached via an `unpack`
        // method, wrap the unpack method to provide debug support for it.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          let content = await original();
          if (!Graph.isTreelike(content)) {
            return content;
          }
          /** @type {any} */
          let graph = Graph.from(content);
          if (!isTransformApplied(ExplorableSiteTransform, graph)) {
            graph = transformObject(ExplorableSiteTransform, graph);
          }
          if (!isTransformApplied(InheritScopeTransform, graph)) {
            graph = transformObject(InheritScopeTransform, graph);
          }
          if (!isTransformApplied(DebugTransform, graph)) {
            graph = transformObject(DebugTransform, graph);
          }
          graph.parent = parent;
          return graph;
        };
      }

      return value;
    }
  };
}

debug.usage = `@debug <graph>\tAdd debug features to a graph`;
debug.documentation = "https://graphorigami.org/language/@debug.html";
