import path from "path";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";
import * as ops from "../language/ops.js";
import CommandsModulesTransform from "../node/CommandModulesTransform.js";

const commands = transformObject(CommandsModulesTransform, builtins);

const ignoreKeys = await ExplorableGraph.keys(commands);
ignoreKeys.push(".");
ignoreKeys.push(ops.thisKey);

export default async function dataflow(variant) {
  let graph = ExplorableGraph.from(variant);
  if (!("formulas" in graph)) {
    graph = transformObject(MetaTransform, graph);
  }

  const flow = {};
  await addFormulaDependencies(flow, graph);
  await addContentDependencies(flow, graph);
  return flow;
}

async function addContentDependencies(flow, graph) {
  for await (const key of graph) {
    const extension = path.extname(key);
    if (extension === ".ori") {
      const value = await graph.get(key);
      const dependencies = await origamiTemplateDependencies(value);
      updateFlowRecord(flow, key, { dependencies });
    }
  }
}

async function addFormulaDependencies(flow, graph) {
  const formulas = await /** @type {any} */ graph.formulas();
  for (const formula of formulas) {
    const { key, expression, source } = formula;
    const dependencies = expression ? codeDependencies(expression) : null;

    if (dependencies?.length === 0) {
      // All dependencies are builtins.
      // Use the RHS of the formula as the dependency.
      const parts = source.split("=");
      const rhs = parts[parts.length - 1]?.trim();
      if (rhs) {
        updateFlowRecord(flow, key, {
          dependencies: [source],
        });
        updateFlowRecord(flow, source, {
          label: rhs,
        });
      } else {
        // Formula is not an assignment.
      }
    } else if (dependencies) {
      // We have at least some dependencies on other values in the graph (not
      // builtins).
      updateFlowRecord(flow, key, { dependencies });

      // Also add the other dependencies to the dataflow.
      dependencies.forEach((dependency) => {
        updateFlowRecord(flow, dependency, {});
      });
    }
  }
}

function codeDependencies(code) {
  if (code instanceof Array) {
    if (code[0] === ops.scope) {
      const key = code[1];
      return ignoreKey(key) ? [] : [key];
    } else {
      return code.flatMap((instruction) => codeDependencies(instruction));
    }
  } else {
    return [];
  }
}

function ignoreKey(key) {
  // HACK: instead of `instanceof Array` to catch ops.thisKey,
  // have parser stop wrapping ops.thisKey in an array.
  if (key instanceof Array) {
    return true;
  } else if (key.startsWith("@")) {
    return true;
  }
  if (!ignoreKeys) {
  }
  return ignoreKeys.includes(key);
}

async function origamiTemplateDependencies(template) {
  if (!template.code) {
    await template.compile();
    return codeDependencies(template.code);
  }
  return [];
}

function updateFlowRecord(flow, key, record) {
  const existingRecord = flow[key];
  if (existingRecord) {
    if (record.dependencies) {
      const existingDependencies = existingRecord.dependencies ?? [];
      existingRecord.dependencies = existingDependencies.concat(
        record.dependencies
      );
    }
  } else {
    flow[key] = record;
  }
}
