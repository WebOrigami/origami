import { Tree } from "@graphorigami/core";
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
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function dataflow(treelike) {
  assertScopeIsDefined(this);
  const tree = Tree.from(treelike);

  const flowFile = await tree.get(".dataflow.yaml");
  const flow = Tree.isAsyncTree(flowFile)
    ? await Tree.plain(flowFile)
    : flowFile
    ? YAML.parse(String(flowFile))
    : {};

  // Determine what keys are relevant to this tree,
  let keysInScope = await getKeysInScope(tree);
  if (flowFile) {
    // Add in any keys defined by the flow file.
    keysInScope = unique(keysInScope, Object.keys(flow));
  }

  const expressions = await getExpressionsInScope(tree);
  await addExpressionDependencies(flow, keysInScope, expressions);

  await addContentDependencies(flow, tree, keysInScope);

  addImplicitJavaScriptDependencies(flow, keysInScope);
  markUndefinedDependencies(flow, keysInScope);

  return flow;
}

// dataflow.usage = `dataflow <tree>\tReturns an analysis of the data flow in the tree`;
// dataflow.documentation = "https://graphorigami.org/cli/builtins.html#dataflow";

async function addContentDependencies(flow, tree, keysInScope) {
  const scope = tree.scope ?? tree;
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
      // We have at least some dependencies on other values in the tree (not
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

async function getExpressionsInScope(tree) {
  const scopeTrees = tree.scope?.trees ?? [tree];
  let expressions = {};
  for (const scopeTree of scopeTrees) {
    const treeExpressions = (await scopeTree.expressions?.()) ?? [];
    for (const key in treeExpressions) {
      if (!expressions[key]) {
        expressions[key] = treeExpressions[key];
      }
    }
  }
  return expressions;
}

async function getKeysInScope(tree) {
  // HACK: Presume that scope is a Scope object.
  const scopeTrees = tree.scope?.trees ?? [tree];
  let keysInScope = [];
  for (const scopeTree of scopeTrees) {
    const scopeTreeKeys = await scopeTree.keys();
    keysInScope.push(...scopeTreeKeys);
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

// Add dependencies found in a tree file.
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
