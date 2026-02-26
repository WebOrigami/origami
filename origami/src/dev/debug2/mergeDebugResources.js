import {
  AsyncMap,
  Tree,
  isUnpackable,
  jsonKeys,
  scope,
  trailingSlash,
} from "@weborigami/async-tree";
import { projectGlobals } from "@weborigami/language";
import indexPage from "../../origami/indexPage.js";

/**
 * Extend the given map-based tree with debugging resources:
 *
 * - default index.html page
 * - default .keys.json resource
 * - support for invoking Origami commands via keys starting with '!'
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 */
export default function mergeDebugResources(maplike) {
  const source = Tree.from(maplike);
  return Object.assign(new AsyncMap(), {
    description: "debug resources",

    async get(key) {
      // Ask the tree if it has the key.
      let value = await source.get(key);

      if (value === undefined) {
        // The tree doesn't have the key; try the defaults.
        if (key === "index.html") {
          // Generate an index page for this site
          value = await indexPage(source);
        } else if (key === ".keys.json") {
          value = await jsonKeys.stringify(source);
        } else if (typeof key === "string" && key.startsWith("!")) {
          return await invokeOrigamiCommand(source, key);
        }
      }

      if (Tree.isMap(value)) {
        // Ensure this transform is applied to any map result
        value = mergeDebugResources(value);
      } else if (value?.unpack) {
        // If the value isn't a tree, but has a tree attached via an `unpack`
        // method, wrap the unpack method to add this transform.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          const content = await original();
          if (!Tree.isTraversable(content) || typeof content === "function") {
            return content;
          }
          /** @type {any} */
          let tree = Tree.from(content);
          return mergeDebugResources(tree);
        };
      }
      return value;
    },

    async keys() {
      return source.keys();
    },

    // If this value is given to the server, the server will call this pack()
    // method. We respond with the index page.
    async pack() {
      return this.get("index.html");
    },

    source,
  });
}

async function invokeOrigamiCommand(tree, key) {
  // Key is an Origami command; invoke it.
  const globals = await projectGlobals(tree);
  const commandName = trailingSlash.remove(key.slice(1).trim());

  // Look for command as a global or Dev command
  const command = globals[commandName] ?? globals.Dev?.[commandName];
  let value;
  if (command) {
    value = await command(tree);
  } else {
    // Look for command in scope
    const parentScope = await scope(tree);
    value = await parentScope.get(commandName);

    if (value === undefined) {
      throw new Error(`Unknown Origami command: ${commandName}`);
    }
  }

  if (trailingSlash.has(key) && isUnpackable(value)) {
    value = await value.unpack();
  }

  return value;
}
