import * as YAMLModule from "yaml";
import StringWithGraph from "../common/StringWithGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import expressionTag from "../language/expressionTag.js";
import ExplorableGraph from "./ExplorableGraph.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * If the given path ends in an extension, return it. Otherwise, return the
 * empty string.
 *
 * This is meant as a basic replacement for the standard Node `path.extname`.
 * That standard function inaccurately returns an extension for a path that
 * includes a near-final extension but ends in a final slash, like "foo.txt/".
 * Node thinks that path has a ".txt" extension, but for our purposes it
 * doesn't.
 *
 * @param {string} path
 */
export function extname(path) {
  // We want at least one character before the dot, then a dot, then a non-empty
  // sequence of characters after the dot that aren't slahes or dots.
  const extnameRegex = /[^/](?<ext>\.[^/\.]+)$/;
  const match = path.match(extnameRegex);
  const extension = match?.groups?.ext.toLowerCase() ?? "";
  return extension;
}

/**
 * Extract front matter from the given text. The first line of the text must be
 * "---", followed by a block of JSON or YAML, followed by another line of
 * "---". Any lines following will be returned added to the data under a
 * `content` key.
 *
 * If the text does not contain front matter, this returns null.
 *
 * @param {string} text
 * @returns {{ frontBlock: string, bodyText: string, frontData: PlainObject }|null}
 */
export function extractFrontMatter(text) {
  const regex =
    /^(?<frontBlock>---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<bodyText>[\s\S]*$)/;
  const match = regex.exec(text);
  if (match) {
    const { frontBlock, frontText, bodyText } = /** @type {any} */ (match)
      .groups;
    const frontData = parseYamlWithExpressions(frontText);
    return { frontBlock, bodyText, frontData };
  } else {
    return null;
  }
}

/**
 * Return the Object prototype at the root of the object's prototype chain.
 *
 * This is used by functions like isPlainObject() to handle cases where the
 * `Object` at the root prototype chain is in a different realm.
 *
 * @param {any} obj
 */
export function getRealmObjectPrototype(obj) {
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}

/**
 * If the given graph has a `scope` property, return that. Otherwise, return the
 * graph itself.
 *
 * @param {Explorable} graph
 * @returns {Explorable}
 */
export function getScope(graph) {
  return /** @type {any} */ (graph)?.scope ?? graph;
}

/**
 * Return true if the object is a plain JavaScript object.
 *
 * @param {any} obj
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(obj) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(obj) === getRealmObjectPrototype(obj);
}

export function isTransformApplied(Transform, obj) {
  let transformName = Transform.name;
  if (!transformName) {
    throw `isTransformApplied was called on an unnamed transform function, but a name is required.`;
  }
  if (transformName.endsWith("Transform")) {
    transformName = transformName.slice(0, -9);
  }
  // Walk up prototype chain looking for a constructor with the same name as the
  // transform. This is not a great test.
  for (let proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
    if (proto.constructor.name === transformName) {
      return true;
    }
  }
  return false;
}

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo", "bar",
 * "baz"].
 *
 * If the path ends with a slash, the last key will be `undefined`.
 *
 * @param {string} pathname
 */
export function keysFromPath(pathname) {
  const keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  if (keys[keys.length - 1] === "") {
    // The path ends with a slash; replace that with `undefined`
    // @ts-ignore
    keys[keys.length - 1] = undefined;
  }
  return keys;
}

export const keySymbol = Symbol("key");

export async function outputWithGraph(obj, graph, emitFrontMatter = false) {
  if (!graph) {
    return obj;
  }
  const objText = String(obj);
  let outputText;
  if (emitFrontMatter) {
    const frontData = await ExplorableGraph.toYaml(graph);
    outputText = `---
${frontData.trimEnd()}
---
${objText}`;
  } else {
    outputText = objText;
  }
  return new StringWithGraph(outputText, graph);
}

export function parseYaml(text) {
  const frontMatter = extractFrontMatter(text);
  if (frontMatter) {
    const { frontData, bodyText } = frontMatter;
    const data = Object.assign(frontData, {
      "@text": bodyText,
    });
    return data;
  } else {
    return parseYamlWithExpressions(text);
  }
}

function parseYamlWithExpressions(text) {
  return YAML.parse(text, {
    customTags: [expressionTag],
  });
}

/**
 * Return a new graph equivalent to the given graph, but with the given context.
 *
 * If the graph already has a `parent` property, this uses the graph as a
 * prototype for the result -- the original graph is not modified. If the graph
 * doesn't have a `parent` property, this applies InheritScopeTransform.
 *
 * @param {GraphVariant} variant
 * @returns {Explorable & { parent: Explorable }}
 */
export function graphInContext(variant, context) {
  // Either method of constructing the target produces a new graph.
  const graph = ExplorableGraph.from(variant);
  const target =
    "parent" in graph
      ? Object.create(graph)
      : transformObject(InheritScopeTransform, graph);
  target.parent = context;
  return target;
}

/**
 * Sort an array of values using natural sort order:
 * https://en.wikipedia.org/wiki/Natural_sort_order
 *
 * @param {any[]} values
 */
export function sortNatural(values) {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
  });
  return values.slice().sort(collator.compare);
}

export function stringLike(value) {
  return (
    typeof value === "string" ||
    value instanceof String ||
    (globalThis.Buffer && value instanceof Buffer)
  );
}

/**
 * Convert the given object to a function.
 *
 * @param {Invocable} obj
 */
export function toFunction(obj) {
  const fn =
    typeof obj === "function"
      ? obj
      : typeof (/** @type {any} */ (obj).toFunction) === "function"
      ? /** @type {any} */ (obj).toFunction()
      : ExplorableGraph.toFunction(obj);
  return fn;
}

/**
 * Attempt to convert the given object to something which can be serialized to
 * text (e.g., as JSON): a plain object, an array, or a string.
 *
 * @param {any} obj
 */
export function toSerializable(obj) {
  if (isPlainObject(obj)) {
    const result = {};
    for (const key in obj) {
      result[key] = toSerializable(obj[key]);
    }
    return result;
  } else if (obj instanceof Array) {
    return obj.map((value) => toSerializable(value));
  } else if (obj instanceof Set) {
    const array = Array.from(obj);
    return array.map((value) => toSerializable(value));
  } else {
    // Leave primitive and built-in types alone
    const t = typeof obj;
    if (
      t === "boolean" ||
      t === "number" ||
      t === "bigint" ||
      t === "string" ||
      obj instanceof Date ||
      obj === null
    ) {
      return obj;
    } else {
      // Unknown type; try to cast to string.
      return obj?.toString?.();
    }
  }
}

/**
 * Apply a functional class mixin to an individual object instance.
 *
 * This works by create an intermediate class, creating an instance of that, and
 * then setting the intermediate class's prototype to the given individual
 * object. The resulting, extended object is then returned.
 *
 * This manipulation of the prototype chain is generally sound in JavaScript,
 * with some caveats. In particular, the original object class cannot make
 * direct use of private members; JavaScript will complain if the extended
 * object does anything that requires access to those private members.
 *
 * @param {Function} Transform
 * @param {any} obj
 */
export function transformObject(Transform, obj) {
  // Apply the mixin to Object and instantiate that. The Object base class here
  // is going to be cut out of the prototype chain in a moment; we just use
  // Object as a convenience because its constructor takes no arguments.
  const mixed = new (Transform(Object))();

  // Find the highest prototype in the chain that was added by the class mixin.
  // The mixin may have added multiple prototypes to the chain. Walk up the
  // prototype chain until we hit Object.
  let mixinProto = Object.getPrototypeOf(mixed);
  while (Object.getPrototypeOf(mixinProto) !== Object.prototype) {
    mixinProto = Object.getPrototypeOf(mixinProto);
  }

  // Redirect the prototype chain above the mixin to point to the original
  // object. The mixed object now extends the original object with the mixin.
  Object.setPrototypeOf(mixinProto, obj);

  // Create a new constructor for this mixed object that reflects its prototype
  // chain. Because we've already got the instance we want, we won't use this
  // constructor now, but this can be used later to instantiate other objects
  // that look like the mixed one.
  mixed.constructor = Transform(obj.constructor);

  // Return the mixed object.
  return mixed;
}
