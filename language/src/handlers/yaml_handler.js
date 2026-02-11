import {
  castArraylike,
  getParent,
  isUnpackable,
  symbols,
  toString,
  Tree,
} from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import * as compile from "../compiler/compile.js";
import projectGlobals from "../project/projectGlobals.js";
import getSource from "./getSource.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

// True if we encountered !ori or !ori.call tags while parsing
let hasOriTags = false;

// When processing the !ori tag, the YAML parser will convert our compiler
// errors into YAML syntax errors. We track the last compiler error so we can
// re-throw it.
let lastCompilerError = null;

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
      throw new Error("YAML handler can only unpack text.");
    }
    const parent = getParent(packed, options);
    const oriCallTag = await oriCallTagForParent(parent, options, yaml);
    const oriTag = await oriTagForParent(parent, options, yaml);
    hasOriTags = false; // Haven't seen any yet

    let data;
    // YAML parser is sync, but top-level !ori or !ori.call tags will return a
    // promise.
    try {
      // @ts-ignore TypeScript complains customTags isn't valid here but it is.
      data = YAML.parse(yaml, {
        customTags: [oriCallTag, oriTag],
      });
    } catch (/** @type {any} */ error) {
      if (error.name === "SyntaxError") {
        // One of our compiler errors, probably thrown by !ori.call tag
        throw error;
      }
      const errorText = yaml.slice(error.pos[0], error.pos[1]);
      const isOriError = errorText === "!ori" || errorText === "!ori.call";
      if (isOriError && lastCompilerError) {
        // Error is in an Origami tag, probably throw by !ori tag. Find the
        // position of the Origami source in the YAML text.
        let offset = error.pos[0] + errorText.length;
        while (/\s/.test(yaml[offset])) {
          offset++;
        }
        lastCompilerError.location.source.offset = offset;
        throw lastCompilerError;
      } else {
        // Some other YAML parsing error
        throw error;
      }
    }

    if (data instanceof Promise) {
      // Top-level !ori or !ori.call tag returned a promise
      data = await data;
    }

    if (hasOriTags) {
      // Resolve any promises in the deep data.
      const tree = Tree.from(data, { deep: true });
      data = await Tree.reduce(tree, (mapped) => castArraylike(mapped));
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

async function oriCallTagForParent(parent, options, yaml) {
  const globals = await projectGlobals(parent);
  return {
    collection: "seq",

    tag: "!ori.call",

    resolve(value) {
      hasOriTags = true;
      /** @type {any[]} */
      const args = typeof value?.toJSON === "function" ? value.toJSON() : value;

      // First arg is Origami source
      const text = args.shift();
      source = getSource(text, options);

      // Offset the source position to account for its location in YAML text
      source.context = yaml;
      const firstItem = value.items[0];
      source.offset = firstItem.range[0];
      if (
        firstItem.type === "QUOTE_DOUBLE" ||
        firstItem.type === "QUOTE_SINGLE"
      ) {
        // Account for opening quote
        source.offset += 1;
      }

      lastCompilerError = null;
      let codeFn;
      try {
        codeFn = compile.expression(source, {
          globals,
          parent,
        });
      } catch (error) {
        lastCompilerError = error;
        throw error;
      }

      // Return a promise for the code's evaluation. If we instead define
      // resolve() as async, the catch block in unpack() won't catch Origami
      // parse errors.
      return new Promise(async (resolve) => {
        // Evaluate the code to get a function
        let fn = await codeFn.call(parent);

        // Call the function with the rest of the args
        if (isUnpackable(fn)) {
          fn = await fn.unpack();
        }

        // Resolve any promise args
        const resolvedArgs = await Promise.all(args);

        const result = await fn.call(null, ...resolvedArgs);
        resolve(result);
      });
    },
  };
}

// Define the !ori tag for YAML parsing. This will run in the context of the
// supplied parent.
async function oriTagForParent(parent, options, yaml) {
  const globals = await projectGlobals(parent);
  return {
    resolve(text) {
      hasOriTags = true;
      source = getSource(text, options);
      source.context = yaml;

      lastCompilerError = null;
      let fn;
      try {
        fn = compile.expression(source, {
          globals,
          parent,
        });
      } catch (error) {
        lastCompilerError = error;
        throw error;
      }

      return fn.call(parent);
    },

    tag: "!ori",
  };
}
