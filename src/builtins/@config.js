import builtins from "../cli/builtins.js";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FilesGraph from "../core/FilesGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import { findConfig } from "./defaultGraph.js";

// The class used to wrap the default graph.
class DefaultGraph extends FileLoadersTransform(
  InheritScopeTransform(ImplicitModulesTransform(FilesGraph))
) {}

/**
 * @this {Explorable}
 */
export default async function config(key) {
  assertScopeIsDefined(this);
  const dirname = process.cwd();
  const cwd = new DefaultGraph(dirname);
  const foundConfig = await findConfig(cwd);
  const config = foundConfig?.config ?? builtins;
  return key === undefined ? config : config.get(key);
}

config.usage = `@\tThe default built-ins used by the ori CLI`;
config.documentation = "https://graphorigami.org/cli/builtins.html#@";
