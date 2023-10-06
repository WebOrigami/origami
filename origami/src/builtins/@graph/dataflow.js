import { Dictionary, Graph } from "@graphorigami/core";
import path from "node:path";
import * as YAMLModule from "yaml";
import { extname } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import * as ops from "../../language/ops.js";
import builtins from "../@builtins.js";

// See notes at serialize.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

const ignoreKeys = Array.from(await builtins.keys());
ignoreKeys.push(".");
ignoreKeys.push("..");

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 */
export default async function dataflow(graphable) {
  assertScopeIsDefined(this);
  const graph = Graph.from(graphable);

  const flowFile = await graph.get(".dataflow.yaml");
  const flow = Dictionary.isAsyncDictionary(flowFile)
    ? await Graph.plain(flowFile)
    : flowFile
    ? YAML.parse(String(flowFile))
    : {};

  // Determine what keys are relevant to this graph,
  let keysInScope = await getKeysInScope(graph);
  if (flowFile) {
    // Add in any keys defined by the flow file.
    keysInScope = unique(keysInScope, Object.keys(flow));
  }

  const expressions = await getExpressionsInScope(graph);
  await addExpressionDependencies(flow, keysInScope, expressions);

  await addContentDependencies(flow, graph, keysInScope);

  addImplicitJavaScriptDependencies(flow, keysInScope);
  markUndefinedDependencies(flow, keysInScope);

  return flow;
}

// dataflow.usage = `dataflow <graph>\tReturns an analysis of the data flow in the graph`;
// dataflow.documentation = "https://graphorigami.org/cli/builtins.html#dataflow";

async function addContentDependencies(flow, graph, keysInScope) {
  const scope = graph.scope ?? graph;
  for (const key of keysInScope) {
    const extension = extname(key);

    const dependencyParsers = {
      ".ori": origamiExpressionDependencies,
      ".html": htmlDependencies,
      ".orit": origamiTemplateDependencies,
    };
    const parser = dependencyParsers[extension];
    if (parser) {
      const value = await scope.get(key);
      if (value) {
        let dependencies = await parser(value, keysInScope);

        updateFlowRecord(flow, key, { dependencies });

        // Also add the dependencies as nodes in the dataflow.
        dependencies.forEach((dependency) => {
          updateFlowRecord(flow, dependency, {});
        });
      }
    }
  }
}

async function addExpressionDependencies(
  flow,
  keysInScope,
  expressions,
  dependentKey = null
) {
  for (const [key, code] of Object.entries(expressions)) {
    const dependencies = code ? codeDependencies(code, keysInScope) : null;

    if (dependencies) {
      // We have at least some dependencies on other values in the graph (not
      // builtins).
      updateFlowRecord(flow, dependentKey ?? key, { dependencies });

      // Also add the dependencies as nodes in the dataflow.
      dependencies.forEach((dependency) => {
        updateFlowRecord(flow, dependency, {});
      });
    }
  }
}

// If there's a dependency on `foo`, and `foo` isn't defined, but `foo.js`
// is, then add an implicit dependency for `foo` on `foo.js`.
function addImplicitJavaScriptDependencies(flow, keysInScope) {
  for (const [_, record] of Object.entries(flow)) {
    const dependencies = record.dependencies ?? [];
    for (const dependency of dependencies) {
      if (extname(dependency) === ".js") {
        continue;
      }
      const dependencyJsKey = `${dependency}.js`;
      if (!flow[dependencyJsKey] && keysInScope.includes(dependencyJsKey)) {
        updateFlowRecord(flow, dependency, {
          dependencies: [dependencyJsKey],
        });
        updateFlowRecord(flow, dependencyJsKey, {});
      }
    }
  }
}

function codeDependencies(code, keysInScope, onlyDependenciesInScope = false) {
  if (code instanceof Array) {
    if (code[0] === ops.scope) {
      const key = code[1];
      const ignore =
        ignoreKey(key) ||
        (onlyDependenciesInScope && !keysInScope.includes(key));
      return ignore ? [] : [key];
    } else {
      const limitDependencies =
        onlyDependenciesInScope || code[0] === ops.lambda;
      return code.flatMap((instruction) =>
        codeDependencies(instruction, keysInScope, limitDependencies)
      );
    }
  } else {
    return [];
  }
}

async function getExpressionsInScope(graph) {
  const scopeGraphs = graph.scope?.graphs ?? [graph];
  let expressions = {};
  for (const scopeGraph of scopeGraphs) {
    const graphExpressions = (await scopeGraph.expressions?.()) ?? [];
    for (const key in graphExpressions) {
      if (!expressions[key]) {
        expressions[key] = graphExpressions[key];
      }
    }
  }
  return expressions;
}

async function getKeysInScope(graph) {
  // HACK: Presume that scope is a Scope object.
  const scopeGraphs = graph.scope?.graphs ?? [graph];
  let keysInScope = [];
  for (const scopeGraph of scopeGraphs) {
    const scopeGraphKeys = await scopeGraph.keys();
    keysInScope.push(...scopeGraphKeys);
  }

  // For any key `foo.js`, add `foo` as a key in scope.
  const jsKeys = keysInScope.filter((key) => extname(key) === ".js");
  const commandKeys = jsKeys.map((jsKey) => path.basename(jsKey, ".js"));
  keysInScope.push(...commandKeys);

  // Remove any keys that should be ignored.
  keysInScope = keysInScope.filter((key) => !ignoreKey(key));

  return unique(keysInScope);
}

async function htmlDependencies(html, keysInScope) {
  // HACK: Use a regex to find img src attributes.
  // TODO: Use a real HTML parser.
  const imgSrcRegex = /<img[\s\S]+?src="(?<src>.+)"[\s\S]+?\/?>/g;
  const matches = [...html.matchAll(imgSrcRegex)];
  const srcs = matches.map((match) => match.groups.src);

  // Take first part of the src path that isn't a "." or "..".
  const pathHeads = srcs.map((src) => {
    const parts = src.split("/");
    if (parts.length === 0) {
      return src;
    }
    while (parts[0] === "." || parts[0] === "..") {
      parts.shift();
    }
    return parts[0];
  });

  // Only return path heads that are in scope.
  const pathHeadsInScope = pathHeads.filter((pathHead) =>
    keysInScope.includes(pathHead)
  );

  return pathHeadsInScope;
}

function ignoreKey(key) {
  if (key.startsWith?.("@")) {
    return true;
  }
  return ignoreKeys.includes(key);
}

function markUndefinedDependencies(flow, keysInScope) {
  for (const record of Object.values(flow)) {
    record.dependencies?.forEach((dependency) => {
      if (!keysInScope.includes(dependency)) {
        const dependencyRecord = flow[dependency];
        if (dependencyRecord) {
          dependencyRecord.undefined = true;
        }
      }
    });
  }
}

// Add dependencies found in a graph file.
async function origamiExpressionDependencies(input, keysInScope) {
  const dependencies = [];
  const value = (await input.unpack?.()) || input;
  if (value && value.expressions) {
    const expressions = await value.expressions?.();
    if (expressions) {
      for (const code of Object.values(expressions)) {
        const expressionDependencies = code
          ? codeDependencies(code, keysInScope)
          : null;
        if (expressionDependencies) {
          dependencies.push(...expressionDependencies);
        }
      }
    }
  }
  return dependencies;
}

async function origamiTemplateDependencies(input, keysInScope) {
  let dependencies = [];
  const fn = (await input.unpack?.()) || input;

  if (fn.code) {
    dependencies = codeDependencies(fn.code, keysInScope);
  }

  // If the template appears to contain HTML, add the HTML dependencies.
  // HACK: Crude heuristic just sees if the first non-space is a "<".
  const templateText = String(input).trim();
  if (templateText.startsWith("<")) {
    dependencies = dependencies.concat(
      await htmlDependencies(input.templateText, keysInScope)
    );
  }

  // For templates, we only consider dependencies that are in scope. References
  // to dependencies not in scope are assumed to refer to keys in the input
  // supplied to the template.
  dependencies = dependencies.filter((dependency) =>
    keysInScope.includes(dependency)
  );

  return dependencies;
}

function updateFlowRecord(flow, key, record) {
  const existingRecord = flow[key];

  if (!existingRecord) {
    flow[key] = record;
  }

  // Merge and de-dupe dependencies.
  const dependencies = unique(
    existingRecord?.dependencies,
    record?.dependencies
  );
  if (dependencies.length > 0) {
    flow[key].dependencies = dependencies;
  }
}

function unique(array1 = [], array2 = []) {
  return [...new Set([...array1, ...array2])];
}