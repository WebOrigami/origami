import path from "node:path";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import FilesGraph from "../core/FilesGraph.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";

// ImplicitModulesTransform will add `.js` to this key.
const configKey = "ori.config";

// The class used to wrap the default graph.
class DefaultGraph extends FileTreeTransform(FilesGraph) {}

export default async function defaultGraph() {
  const dirname = process.cwd();
  const cwd = new DefaultGraph(dirname);

  const foundConfig = await findConfig(cwd);
  if (!foundConfig) {
    // Use current directory and default config.
    cwd.parent = builtins;
    return cwd;
  }

  const configContainerPath = foundConfig.container.path;
  const relative = path.relative(configContainerPath, dirname);
  const keys = relative.split(path.sep);
  const top = new DefaultGraph(configContainerPath);
  top.parent = foundConfig.config;
  const current = await ExplorableGraph.traverse(top, ...keys);
  return current;
}

// Return the exported value of the Origami config file and the graph for its
// container. Return undefined if not found.
export async function findConfig(cwd) {
  let current = cwd;
  while (current) {
    const config = await current.get(configKey);
    if (config) {
      // Found a configuration
      return {
        config,
        container: current,
      };
    }
    const parent = await current.get("..");
    if (!parent || parent.path === current.path) {
      break;
    }
    current = parent;
  }
  return undefined;
}

defaultGraph.usage = `defaultGraph\tThe default graph used by the ori CLI`;
defaultGraph.documentation =
  "https://graphorigami.org/cli/builtins.html#defaultGraph";
