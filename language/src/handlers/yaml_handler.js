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
import getSource from "./getSource.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

// The source of the last Origami line parsed in a YAML file, used for errors
let source;

/**
 * A YAML file
 *
 * Unpacking a YAML file returns the parsed data.
 *
 */
export default {
  mediaType: "application/yaml",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const yaml = toString(packed);
    if (!yaml) {
      throw new Error("Tried to parse something as YAML but it wasn't text.");
    }
    const parent = getParent(packed, options);
    const oriCallTag = await oriCallTagForParent(parent, options);
    const oriTag = await oriTagForParent(parent, options);

    let data;
    // YAML parser is sync, but top-level !ori or !ori.call tags will return a
    // promise.
    try {
      // @ts-ignore TypeScript complains customTags isn't valid here but it is.
      data = await YAML.parse(yaml, {
        customTags: [oriCallTag, oriTag],
      });
    } catch (/** @type {any} */ error) {
      const errorText = yaml.slice(error.pos[0], error.pos[1]);
      const isOriError = errorText === "!ori" || errorText === "!ori.call";
      if (isOriError && source) {
        // Error is in an Origami tag. Strip down error message to recover our
        // error message, convert YAML error location to Origami source location
        // and throw our own compiler error.
        const position = error.message.indexOf(" at line ");
        const message =
          position !== -1 ? error.message.slice(0, position) : error.message;
        const compilerError = new Error(
          `Couldn't parse Origami code in YAML: ${message}`
        );
        /** @type {any} */ (compilerError).location = {
          end: {
            column: error.linePos[1].col,
            line: error.linePos[1].line,
            offset: error.pos[1],
          },
          source: {
            ...source,
            text: yaml,
          },
          start: {
            column: error.linePos[0].col,
            line: error.linePos[0].line,
            offset: error.pos[0],
          },
        };
        throw compilerError;
      } else {
        // Some other YAML parsing error
        throw error;
      }
    }

    if (data && typeof data === "object" && Object.isExtensible(data)) {
      Object.defineProperty(data, symbols.deep, {
        enumerable: false,
        value: true,
      });
    }
    return data;
  },
};

async function oriCallTagForParent(parent, options) {
  const globals = await projectGlobals();
  return {
    collection: "seq",

    tag: "!ori.call",

    identify: (value) => false,

    async resolve(value) {
      /** @type {any[]} */
      const args = typeof value?.toJSON === "function" ? value.toJSON() : value;

      // First arg is Origami source
      const text = args.shift();
      source = getSource(text, options);

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
async function oriTagForParent(parent, options) {
  const globals = await projectGlobals();
  return {
    identify: expressionFunction.isExpressionFunction,

    resolve(text) {
      source = getSource(text, options);
      const fn = compile.expression(source, {
        globals,
        parent,
      });
      return fn.call(parent);
    },

    tag: "!ori",
  };
}
