import { DeferredGraph, FilesGraph } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import CommandModulesTransform from "../common/CommandModulesTransform.js";
import ImportModulesMixin from "../common/ImportModulesMixin.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const loadersFolder = path.resolve(dirname, "../loaders");

// Directly loading the FilesGraph here causes an error: "Cannot access
// 'FilesGraph' before initialization". This is a result of a circular reference
// introduced at the point when we added Origami expression tags to the .yaml
// loader. It was difficult to diagnose the root of that problem, so for now we
// just defer loading of the graph.
//
// We don't apply FileTreeTransform here because that imports
// FileLoadersTransform which eventually imports this file. For the loaders, we
// don't need the InheritScopeTransform, so we can just apply
// CommandModulesTransform and ImportModulesMixin directly.

/** @type {any} */
const loaders = new DeferredGraph(
  () =>
    new (CommandModulesTransform(ImportModulesMixin(FilesGraph)))(loadersFolder)
);

export default loaders;

// loaders.usage = `loaders\tThe default file loaders used by the ori CLI`;
// loaders.documentation = "https://graphorigami.org/cli/builtins.html#loaders";
