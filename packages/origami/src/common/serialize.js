/**
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 */

import { Dictionary, Graph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import MapValuesGraph from "../common/MapValuesGraph.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import expressionTag from "../language/expressionTag.js";
import ExpressionGraph from "./ExpressionGraph.js";
import { castArrayLike, isPlainObject } from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

// Return true if the given object has any functions in it.
function objectContainsFunctions(obj) {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "function") {
      return true;
    } else if (isPlainObject(value)) {
      const valueContainsExpression = objectContainsFunctions(value);
      if (valueContainsExpression) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Extract front matter from the given text. The first line of the text must be
 * "---", followed by a block of JSON or YAML, followed by another line of
 * "---". Any lines following will be returned added to the data under a
 * `content` key.
 *
 * @typedef {import("../..").JsonValue} JsonValue
 *
 * @param {string} text
 * @returns {{ data: JsonValue|AsyncDictionary|null, text: string }}
 */
export function parseDocumentWithFrontMatter(text) {
  const regex =
    /^(?<frontBlock>---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<bodyText>[\s\S]*$)/;
  const match = regex.exec(text);
  if (match?.groups) {
    const data = parseYaml(match.groups.frontText);
    return { data, text: match.groups.bodyText };
  } else {
    return { data: null, text };
  }
}

/**
 * @param {string} text
 * @returns {JsonValue|AsyncDictionary}
 */
export function parseYaml(text) {
  const data = YAML.parse(text, {
    customTags: [expressionTag],
  });
  if (objectContainsFunctions(data)) {
    return new (FileTreeTransform(ExpressionGraph))(data);
  } else {
    return data;
  }
}

/**
 * @param {string} text
 * @param {JsonValue|AsyncDictionary|null} data
 */
export async function renderDocumentWithFrontMatter(text, data) {
  if (data) {
    const frontMatter = (await toYaml(data)).trimEnd();
    return `---\n${frontMatter}\n---\n${text}`;
  } else {
    return text;
  }
}

/**
 * Converts the graph into a plain JavaScript object with the same structure
 * as the graph, but which can be serialized to text. All keys will be cast to
 * strings, and all values reduced to native JavaScript types as best as
 * possible.
 *
 * @param {Graphable} graphable
 */
export async function serializableObject(graphable) {
  const serializable = new MapValuesGraph(graphable, toSerializable, {
    deep: true,
  });
  const plain = await Graph.plain(serializable);
  const cast = castArrayLike(plain);
  return cast;
}

/**
 * Returns the graph as a JSON string.
 *
 * @param {JsonValue|AsyncDictionary|null} obj
 */
export async function toJson(obj) {
  const serializable = await serializableObject(obj);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Attempt to convert the given object to something which can be serialized to
 * text (e.g., as JSON): a plain object, an array, or a string.
 *
 * @param {any} obj
 */
export function toSerializable(obj) {
  if (Dictionary.isPlainObject(obj)) {
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
 * Returns the graph as a YAML string.
 *
 * @param {JsonValue|AsyncDictionary} obj
 * @returns {Promise<string>}
 */
export async function toYaml(obj) {
  const serializable = await serializableObject(obj);
  return YAML.stringify(serializable);
}
