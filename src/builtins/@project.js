import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";
import { graphInContext } from "../core/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import builtins from "./@builtins.js";

const configFileName = "ori.config.js";

// The class used to wrap the default graph.
class DefaultGraph extends FileTreeTransform(
  ImplicitModulesTransform(FilesGraph)
) {}

/**
 * Return the graph for the current project's root folder.
 *
 * This searches the current directory and its ancestors for an Origami
 * configuration file. If a variant is provided, the ancestor search will begin
 * at that point; otherwise, the search begins at the current directory.
 *
 * If an Origami configuration file is found, the containing folder is
 * considered to be the project root. This returns a graph for that folder, with
 * the exported configuration as the context for that folder — that is, the
 * graph exported by the configuration will be the scope.
 *
 * If no Origami configuration file is found, the current folder will be
 * returned as a graph, with the builtins as its parent.
 *
 * @this {Explorable}
 * @param {any} [key]
 */
export default async function project(key) {
  assertScopeIsDefined(this);

  const dirname = process.cwd();
  const currentGraph = new DefaultGraph(dirname);
  let projectGraph = await findConfigContainer(currentGraph);

  let config;
  if (projectGraph) {
    // Load the configuration.
    config = await projectGraph.import(configFileName);
    if (!config) {
      throw new Error(
        `Couldn't load the Origami configuration in ${projectGraph.path}`
      );
    }
  } else {
    projectGraph = currentGraph;
    config = builtins;
  }

  // Add the configuration as the context for the project root.
  const result = graphInContext(projectGraph, config);
  return key === undefined ? result : result.get(key);
}

async function findConfigContainer(start) {
  let current = start;
  while (current) {
    const config = await current.get(configFileName);
    if (config) {
      // Found a configuration; its container is the project root.
      return current;
    }
    // Not found; try the parent.
    const parent = await current.get("..");
    if (
      !parent ||
      (parent.path && current.path && parent.path === current.path)
    ) {
      break;
    }
    current = parent;
  }
  return undefined;
}

project.usage = `@project\tThe root of the current Graph Origami project`;
project.documentation = "https://graphorigami.org/language/@project.html";
