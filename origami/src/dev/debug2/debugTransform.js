import {
  AsyncMap,
  Tree,
  box,
  castArraylike,
  isUnpackable,
  jsonKeys,
  scope,
  trailingSlash,
} from "@weborigami/async-tree";
import { toYaml } from "../../common/serialize.js";
import indexPage from "../../origami/indexPage.js";
import * as debugCommands from "./debugCommands.js";
import debugValue from "./debugValue.js";
import isSimpleObject from "./isSimpleObject.js";

/**
 * Transform the given map-based tree to add debugging resources:
 *
 * - default index.html page
 * - default .keys.json resource
 * - support for invoking Origami commands via keys starting with '!'
 *
 * Also transform a simple object result to YAML for viewing.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} input
 */
export default function debugTransform(input) {
  const source = Tree.from(input, { deep: true });

  return Object.assign(new AsyncMap(), {
    description: "debug resources",

    async get(key) {
      // Ask the tree if it has the key.
      let value = await source.get(key);

      if (value === undefined) {
        // Try the defaults and commands
        if (key === "index.html") {
          value = await indexPageOrYaml(source);
        } else if (key === ".keys.json") {
          value = await jsonKeys.stringify(source);
        } else if (typeof key === "string" && key.startsWith("!")) {
          value = await invokeOrigamiCommand(source, key);
        }
      }

      // Ensure this transform is applied to any map or unpackable result.
      value = await debugValue(value);

      return value;
    },

    async *keys() {
      yield* source.keys();
    },

    // If this value is given to the server, the server will call this pack()
    // method. If the source defines pack(), we use that, otherwise we return
    // undefined. The server will redirect to the URL with a trailing slash,
    // which will call `get("index.html")` (above) to get the index page.
    async pack() {
      return /** @type {any} */ (source)?.pack?.();
    },

    // @ts-ignore
    parent: source.parent,

    source,

    trailingSlashKeys: true,
  });
}

async function indexPageOrYaml(value) {
  // Try casting an arraylike map to an array
  // This reads values, which might throw.
  try {
    value = castArraylike(value);
  } catch (/** @type {any} */ error) {
    return indexPage(value);
  }

  if (isSimpleObject(value)) {
    // Return YAML but allow it to be further traversed
    const object = value;
    const yamlText = await toYaml(object);
    const boxed = box(yamlText);
    boxed.unpack = () => debugTransform(object);
    return boxed;
  } else {
    // Generate an index page for the value
    return indexPage(value);
  }
}

async function invokeOrigamiCommand(tree, key) {
  // Key is an Origami command; invoke it.
  const commandName = trailingSlash.remove(key.slice(1).trim());

  // Look for the indicated command
  const command = debugCommands[commandName];
  let value;
  if (command) {
    value = command instanceof Function ? await command(tree) : command;
  } else {
    // Look for command in scope
    const parentScope = await scope(tree);
    value = await parentScope.get(commandName);
  }

  if (trailingSlash.has(key) && isUnpackable(value)) {
    value = await value.unpack();
  }

  return value;
}
