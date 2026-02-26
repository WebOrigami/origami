import {
  box,
  isPlainObject,
  isPrimitive,
  isUnpackable,
  Tree,
} from "@weborigami/async-tree";
import { evaluate, OrigamiFileMap, projectGlobals } from "@weborigami/language";
import http from "node:http";
import indexPage from "../../origami/indexPage.js";
import yaml from "../../origami/yaml.js";
import { requestListener } from "../../server/server.js";
import mergeDebugResources from "./mergeDebugResources.js";

export default async function debugChildServer(expression, parentPath) {
  // Evaluate the expression
  const parent = new OrigamiFileMap(parentPath);
  const globals = await projectGlobals(parent);
  let maplike = await evaluate(expression, { globals, mode: "shell", parent });

  if (isUnpackable(maplike)) {
    maplike = await maplike.unpack();
  }
  // REVIEW: why did we need this?
  if (maplike instanceof Function) {
    maplike = await maplike();
  }
  if (!Tree.isMaplike(maplike)) {
    return null; // Caller will handle error
  }

  // Add debugging resources
  const merged = mergeDebugResources(maplike);

  // Use the result as the tree of resources
  const listener = requestListener(merged);
  const server = http.createServer(listener);

  return server;
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

/**
 * Apply preprocessing to the resource before constructing a response.
 */
async function preprocessResource(resource) {
  if (resource instanceof Function) {
    // Invoke the function to get the final desired result
    resource = await resource();
  }

  if (Tree.isMaplike(resource)) {
    // Note: the following operations can invoke project code, so may throw
    let map = await Tree.from(resource);
    let indexHtml = await map.get("index.html");
    if (indexHtml instanceof Function) {
      indexHtml = await indexHtml(); // Get the actual index page
    }
    if (indexHtml) {
      // Return index.html page
      resource = indexHtml;
      // Like Origami.indexPage() does, we attach an unpack() method to get the
      // underlying map. If the index page loads relative resources, those will
      // be loaded from the map.
      resource = box(resource);
      resource.unpack = () => map;
    } else if (isSimpleObject(resource)) {
      // Serialize to YAML
      resource = await yaml(map);
    } else {
      // Return index page
      resource = await indexPage(map);
    }
  }

  return resource;
}
