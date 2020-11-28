import { Explorable } from "@explorablegraph/core";
import path from "path";
import process from "process";

// Returns either the JSON contents from stdin (if arg is "-") or a graph.
export async function loadGraphFromArgument(arg) {
  const loaded = await loadTextOrGraphFromArgument(arg);
  const result =
    typeof loaded === "string" ? new Explorable(JSON.parse(loaded)) : loaded;
  return result;
}

// Returns either the text contents from stdin (if arg is "-") or a graph.
export async function loadTextOrGraphFromArgument(arg) {
  let result;
  if (arg === "-") {
    return await textFromReadable(process.stdin);
  } else {
    const graphModulePath = path.resolve(process.cwd(), arg);
    result = await loadGraphFromModule(graphModulePath);
    if (!result) {
      console.error(
        `Could not load ${graphModulePath} as a JavaScript module.`
      );
      return;
    }
    // if (!(graph instanceof Graph)) {
    //   console.error(
    //     `graph: Default export of ${sourcePath} should be an instance of Graph, but was ${graph.constructor.name}.`
    //   );
    //   return;
    // }
  }
  return result;
}

export async function loadGraphFromModule(modulePath) {
  let fn = null;
  try {
    const module = await import(modulePath);
    fn = module.default;
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      return null;
    }
    return null;
  }
  const value = typeof fn === "function" ? fn() : fn;
  return value;
}

function textFromReadable(readable) {
  return new Promise((resolve) => {
    const chunks = [];

    readable.on("readable", () => {
      let chunk;
      while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
      }
    });

    readable.on("end", () => {
      const content = chunks.join("");
      resolve(content);
    });
  });
}
