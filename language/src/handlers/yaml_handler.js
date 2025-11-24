import {
  getParent,
  isUnpackable,
  symbols,
  toString,
} from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";
import * as expressionFunction from "../runtime/expressionFunction.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

/**
 * A YAML file
 *
 * Unpacking a YAML file returns the parsed data.
 *
 */
export default {
  mediaType: "application/yaml",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed) {
    const yaml = toString(packed);
    if (!yaml) {
      throw new Error("Tried to parse something as YAML but it wasn't text.");
    }
    const parent = getParent(packed);
    const oriCallTag = await oriCallTagForParent(parent);
    const oriTag = await oriTagForParent(parent);
    const data = YAML.parse(yaml, {
      customTags: [oriCallTag, oriTag],
    });
    if (data && typeof data === "object" && Object.isExtensible(data)) {
      Object.defineProperty(data, symbols.deep, {
        enumerable: false,
        value: true,
      });
    }
    return data;
  },
};

async function oriCallTagForParent(parent) {
  const globals = await projectGlobals();
  return {
    collection: "seq",

    tag: "!ori.call",

    identify: (value) => false,

    async resolve(value) {
      /** @type {any[]} */
      const args = typeof value?.toJSON === "function" ? value.toJSON() : value;
      // First arg is Origami source
      const source = args.shift();
      const codeFn = compile.expression(source, {
        globals,
        parent,
      });
      // Evaluate the code to get a function
      let fn = await codeFn.call(parent);
      // Call the function with the rest of the args
      if (isUnpackable(fn)) {
        fn = await fn.unpack();
      }
      return fn.call(null, ...args);
    },
  };
}

// Define the !ori tag for YAML parsing. This will run in the context of the
// supplied parent.
async function oriTagForParent(parent) {
  const globals = await projectGlobals();
  return {
    identify: expressionFunction.isExpressionFunction,

    resolve(source) {
      const fn = compile.expression(source, {
        globals,
        parent,
      });
      return fn.call(parent);
    },

    tag: "!ori",
  };
}
