import {
  AsyncMap,
  Tree,
  box,
  isPlainObject,
  isPrimitive,
  isUnpackable,
  jsonKeys,
  scope,
  trailingSlash,
} from "@weborigami/async-tree";
import { projectGlobals } from "@weborigami/language";
import indexPage from "../../origami/indexPage.js";
import yaml from "../../origami/yaml.js";

/**
 * Transform the given map-based tree to add debugging resources:
 *
 * - default index.html page
 * - default .keys.json resource
 * - support for invoking Origami commands via keys starting with '!'
 *
 * Also transform a simple object result to YAML for viewing.
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 */
export default function debugTransform(maplike) {
  const source = Tree.from(maplike, { deep: true });
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
          value = await invokeOrigamiCommand(source, key);
        }
      }

      if (isSimpleObject(value)) {
        // Serialize to YAML, but also allow the result to be further traversed
        const object = value;
        const yamlText = await yaml(object);
        value = box(yamlText);
        value.unpack = () =>
          Tree.merge(object, {
            "index.html": yamlText,
          });
      } else if (Tree.isMaplike(value) && !Tree.isMap(value)) {
        // Make it a map so we can debug it
        value = Tree.from(value);
      }

      if (Tree.isMap(value)) {
        // Ensure this transform is applied to any map result
        value = debugTransform(value);
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
          return debugTransform(tree);
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

    trailingSlashKeys: true,
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

/**
 * Returns true if the object is "simple": a plain object or array that does not
 * have any getters in its deep structure.
 *
 * This test is used to avoid serializing complex objects to YAML.
 *
 * @param {any} object
 */
function isSimpleObject(object) {
  if (!(object instanceof Array || isPlainObject(object))) {
    return false;
  }

  for (const key of Object.keys(object)) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor) {
      continue; // not sure why this would happen
    } else if (typeof descriptor.get === "function") {
      return false; // Getters aren't simple
    } else if (isPrimitive(descriptor.value)) {
      continue; // Primitives are simple
    } else if (!isSimpleObject(descriptor.value)) {
      return false; // Deep structure wasn't simple
    }
  }

  return true;
}
