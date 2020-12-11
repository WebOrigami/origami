import {
  asyncGet,
  asyncKeys,
  asyncSet,
  get,
  keys as keysSymbol,
  set,
} from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";
import Explorable from "./Explorable.js";

/**
 * Returns the keys for an async graph.
 *
 * @param {any} graph
 */
export async function keys(graph) {
  const result = [];
  for await (const key of graph) {
    result.push(key);
  }
  return result;
}

/**
 * Create a plain JavaScript object with the graph's keys cast to strings,
 * and the given `mapFn` applied to values.
 *
 * @param {any} graph
 * @param {any} mapFn
 */
export async function mapValues(graph, mapFn) {
  const result = {};
  const graphKeys = graph[keysSymbol]
    ? graph[keysSymbol]()
    : graph[asyncKeys]();
  for await (const key of graphKeys) {
    const value = graph[get] ? graph[get](key) : await graph[asyncGet](key);
    // TODO: Check that value is of same constructor before traversing into it.
    result[String(key)] =
      value !== undefined &&
      (value instanceof AsyncExplorable || value instanceof Explorable)
        ? // value is also explorable; traverse into it.
          await mapValues(value, mapFn)
        : await mapFn(value);
  }
  return result;
}

/**
 * Converts a graph into a plain JavaScript object.
 *
 * The result's keys will be the graph's keys cast to strings. Any graph value
 * that is itself a graph will be similarly converted to a plain object.
 *
 * @param {any} graph
 */
export async function plain(graph) {
  return await mapValues(graph, (/** @type {any} */ value) => value);
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values cast to strings.
 *
 * @param {any} graph
 */
export async function strings(graph) {
  return await mapValues(graph, async (obj) => String(await obj));
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values being `null`.
 *
 * The result's keys will be the graph's keys cast to strings. Any graph value
 * that is itself a graph will be similarly converted to its structure.
 *
 * @param {any} graph
 */
export async function structure(graph) {
  return await mapValues(graph, () => null);
}

/**
 * Performs a depth-first traversal of the explorable.
 *
 * Note: This does not check for or prevent cycles.
 *
 * @param {*} graph
 * @param {function} callback
 * @param {[any[]]} route
 */
export async function traversal(graph, callback, route = []) {
  const getFn = graph[get] ? get : asyncGet;
  const graphKeys = graph[keysSymbol]
    ? graph[keysSymbol]()
    : graph[asyncKeys]();
  for await (const key of graphKeys) {
    const extendedRoute = [...route, key];
    const value = await graph[getFn](key);
    const interior =
      value instanceof AsyncExplorable || value instanceof Explorable;
    callback(extendedRoute, interior, value);
    if (interior) {
      await traversal(value, callback, extendedRoute);
    }
  }
}

export async function update(target, source) {
  const setFn = target[set] ? set : asyncSet;
  await traversal(source, async (route, interior, value) => {
    if (!interior) {
      await target[setFn](...route, value);
    }
  });
  return target;
}
