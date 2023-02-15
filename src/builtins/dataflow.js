import path from "node:path";
import * as YAMLModule from "yaml";
import builtins from "../cli/builtins.js";
import CommandsModulesTransform from "../common/CommandModulesTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { extname, transformObject } from "../core/utilities.js";
import * as ops from "../language/ops.js";

// See notes at ExplorableGraph.js
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

const commands = transformObject(CommandsModulesTransform, builtins);

const ignoreKeys = await ExplorableGraph.keys(commands);
ignoreKeys.push(".");
ignoreKeys.push("..");
ignoreKeys.push(ops.thisKey);

export default async function dataflow(variant) {
  const graph = ExplorableGraph.from(variant);

  const flowFile = await graph.get(".dataflow.yaml");
  const flow = ExplorableGraph.isExplorable(flowFile)
    ? await ExplorableGraph.plain(flowFile)
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

dataflow.usage = `dataflow <graph>\tReturns an analysis of the data flow in the graph`;
dataflow.documentation = "https://graphorigami.org/cli/builtins.html#dataflow";

async function addContentDependencies(flow, graph, keysInScope) {
  const scope = graph.scope ?? graph;
  for await (const key of keysInScope) {
    const extension = extname(key);

    const dependencyParsers = {
      ".graph": graphDependencies,
      ".html": htmlDependencies,
      ".ori": origamiTemplateDependencies,
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
    const scopeGraphKeys = await (scopeGraph.allKeys?.() ??
      ExplorableGraph.keys(scopeGraph));
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

// Add dependnecies found in a graph file.
async function graphDependencies(graphFile, keysInScope) {
  const dependencies = [];
  const attachedGraph = graphFile.toGraph?.();
  if (attachedGraph) {
    const expressions = await attachedGraph.expressions?.();
    if (expressions) {
      for (const [key, code] of Object.entries(expressions)) {
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

async function origamiTemplateDependencies(template, keysInScope) {
  let dependencies = [];
  if (!template.code) {
    await template.compile();
    dependencies = codeDependencies(template.code, keysInScope);
  }

  // If the template appears to contain HTML, add the HTML dependencies.
  // HACK: Crude heuristic just sees if the first non-space is a "<".
  if (template.templateText.trim().startsWith("<")) {
    dependencies = dependencies.concat(
      await htmlDependencies(template.templateText, keysInScope)
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
