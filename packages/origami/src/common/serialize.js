/**
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("../..").StringLike} StringLike
 */

import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import * as YAMLModule from "yaml";
import MapValuesGraph from "../common/MapValuesGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import expressionTag from "../language/expressionTag.js";
import { castArrayLike } from "./utilities.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * Extract front matter from the given text. The first line of the text must be
 * "---", followed by a block of JSON or YAML, followed by another line of
 * "---". Any lines following will be returned added to the data under a
 * `content` key.
 *
 * If the text does not contain front matter, the front matter properties will
 * be null.
 *
 * @param {StringLike} input
 * @returns {{ bodyText: string, frontBlock: string|null, frontData: PlainObject|null,
 * frontText: string|null }}
 */
export function extractFrontMatter(input) {
  const text = String(input);
  const regex =
    /^(?<frontBlock>---\r?\n(?<frontText>[\s\S]*?\r?\n)---\r?\n)(?<bodyText>[\s\S]*$)/;
  const match = regex.exec(text);
  let frontBlock;
  let frontData;
  let frontText;
  let bodyText;
  if (match?.groups) {
    bodyText = match.groups.bodyText;
    frontBlock = match.groups.frontBlock;
    frontText = match.groups.frontText;

    frontData = parseYamlWithExpressions(frontText);
  } else {
    frontBlock = null;
    frontData = null;
    frontText = null;
    bodyText = text;
  }
  return { bodyText, frontBlock, frontData, frontText };
}
/**
 * Parse the given object as JSON text and return the corresponding explorable
 * graph.
 *
 * Empty text will be treated as an empty object.
 *
 * @param {any} obj
 */
export function fromJson(obj) {
  let parsed = JSON.parse(obj);
  if (parsed === null) {
    // String was empty or just YAML comments.
    parsed = {};
  }
  return new ObjectGraph(parsed);
}

/**
 * Parse the given object as YAML text and return the corresponding explorable
 * graph.
 *
 * Empty text (or text with just comments) will be treated as an empty object.
 *
 * @param {any} obj
 */
export function fromYaml(obj) {
  let parsed = parseYaml(String(obj));
  if (parsed === null) {
    // String was empty or just YAML comments.
    parsed = {};
  }
  return new ObjectGraph(parsed);
}

export async function outputWithGraph(obj, graph, emitFrontMatter = false) {
  const objText = String(obj);
  if (!graph) {
    return objText;
  }
  let outputText;
  if (emitFrontMatter) {
    const frontData = await toYaml(graph);
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
  const { frontData, bodyText } = extractFrontMatter(text);
  if (frontData) {
    const data = Object.assign(frontData, {
      "@text": bodyText,
    });
    return data;
  } else {
    return parseYamlWithExpressions(text);
  }
}

export function parseYamlWithExpressions(text) {
  return YAML.parse(text, {
    customTags: [expressionTag],
  });
}

/**
 * Converts the graph into a plain JavaScript object with the same structure
 * as the graph, but which can be serialized to text. All keys will be cast to
 * strings, and all values reduced to native JavaScript types as best as
 * possible.
 *
 * @param {GraphVariant} variant
 */
export async function serializableObject(variant) {
  const serializable = new MapValuesGraph(variant, toSerializable, {
    deep: true,
  });
  const plain = await GraphHelpers.plain(serializable);
  const cast = castArrayLike(plain);
  return cast;
}

/**
 * Returns the graph as a JSON string.
 *
 * @param {GraphVariant} variant
 */
export async function toJson(variant) {
  const serializable = await serializableObject(variant);
  return JSON.stringify(serializable, null, 2);
}

/**
 * Attempt to convert the given object to something which can be serialized to
 * text (e.g., as JSON): a plain object, an array, or a string.
 *
 * @param {any} obj
 */
export function toSerializable(obj) {
  if (GraphHelpers.isPlainObject(obj)) {
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
 * @param {GraphVariant} variant
 * @returns {Promise<string>}
 */
export async function toYaml(variant) {
  const serializable = await serializableObject(variant);
  return YAML.stringify(serializable);
}
