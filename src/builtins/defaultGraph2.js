import path from "path";
import builtins from "../cli/builtins.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import ExplorableFiles from "../node/ExplorableFiles.js";
import FileLoadersTransform from "../node/FileLoadersTransform.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";

const configKey = "ori.config";

class DefaultGraph extends FileLoadersTransform(
  InheritScopeTransform(ImplicitModulesTransform(ExplorableFiles))
) {}

export default async function defaultGraph() {
  const dirname = process.cwd();
  const cwd = new DefaultGraph(dirname);

  const found = await findConfig(cwd);
  if (!found) {
    // Use current directory and default config.
    cwd.parent = builtins;
    return cwd;
  }

  const configContainerPath = found.container.path;
  const relative = path.relative(configContainerPath, dirname);
  const keys = relative.split(path.sep);
  const top = new DefaultGraph(configContainerPath);
  top.parent = found.config;
  const current = await ExplorableGraph.traverse(top, ...keys);
  return current;
}

// Return the container of the Origami config file.
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
  "https://explorablegraph.org/cli/builtins.html#defaultGraph";
