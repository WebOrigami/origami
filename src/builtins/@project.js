import ExplorableGraph from "../core/ExplorableGraph.js";
import FilesGraph from "../core/FilesGraph.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

const configFileName = "ori.config.js";

// The class used to wrap the default graph.
class DefaultGraph extends FileTreeTransform(FilesGraph) {}

/**
 * Search the current directory and its ancestors for an Origami configuration
 * file. If found, return the container graph; return undefined otherwise.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function project(variant) {
  assertScopeIsDefined(this);
  let graph;
  if (variant) {
    graph = ExplorableGraph.from(variant);
  } else {
    const dirname = process.cwd();
    graph = new DefaultGraph(dirname);
  }

  let current = graph;
  while (current) {
    const config = await current.get(configFileName);
    if (config) {
      // Found a configuration, return its container.
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
project.documentation = "https://graphorigami.org/cli/builtins.html#@project";
