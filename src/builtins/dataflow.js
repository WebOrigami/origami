import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";
import * as ops from "../language/ops.js";
import CommandsModulesTransform from "../node/CommandModulesTransform.js";

const commands = transformObject(CommandsModulesTransform, builtins);

export default async function dataflow(variant) {
  let graph = ExplorableGraph.from(variant);
  if (!("formulas" in graph)) {
    graph = transformObject(MetaTransform, graph);
  }

  const ignoreKeys = await ExplorableGraph.keys(commands);
  ignoreKeys.push(".");
  ignoreKeys.push(ops.thisKey);

  const flow = {};
  const formulas = await graph.formulas();
  for (const formula of formulas) {
    const { key, expression } = formula;
    const dependencies = expression
      ? findDependencies(expression, ignoreKeys)
      : null;
    if (dependencies) {
      if (dependencies.length === 0) {
        // All dependencies are builtins.
        // Use the RHS of the formula as the dependency.
        const parts = formula.source.split("=");
        const rhs = parts[parts.length - 1]?.trim();
        if (rhs) {
          dependencies.push(rhs);
        }
      }

      const existingDependencies = flow[key] ?? [];
      flow[key] = existingDependencies.concat(dependencies);

      // Add the dependencies to the dataflow.
      dependencies.forEach((dependency) => {
        if (!flow[dependency]) {
          flow[dependency] = [];
        }
      });
    }
  }

  return flow;
}

function findDependencies(code, ignoreKeys) {
  if (code instanceof Array) {
    if (code[0] === ops.scope) {
      const key = code[1];
      // HACK: instead of `instanceof Array` to catch ops.thisKey,
      // have parser stop wrapping ops.thisKey in an array.
      return key instanceof Array || ignoreKeys.includes(key) ? [] : [key];
    } else {
      return code.flatMap((instruction) =>
        findDependencies(instruction, ignoreKeys)
      );
    }
  } else {
    return [];
  }
}
