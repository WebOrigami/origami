import builtins from "../cli/builtins.js";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { findConfig } from "./defaultGraph.js";

// The class used to wrap the default graph.
class DefaultGraph extends FileLoadersTransform(
  InheritScopeTransform(ImplicitModulesTransform(FilesGraph))
) {}

export default async function config(key) {
  const dirname = process.cwd();
  const cwd = new DefaultGraph(dirname);
  const foundConfig = await findConfig(cwd);
  const config = foundConfig?.config ?? builtins;
  return key === undefined ? config : config.get(key);
}

config.usage = `@\tThe default graph used by the ori CLI`;
config.documentation = "https://explorablegraph.org/cli/builtins.html#@";
