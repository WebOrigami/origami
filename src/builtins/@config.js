import project from "./@project.js";

export default async function config(key) {
  const projectGraph = await project.call(this);
  const scope = projectGraph?.parent;
  if (!scope) {
    return undefined;
  }
  return key === undefined ? scope : scope.get(key);
}

config.usage = `@config\tThe current project's configuration graph`;
config.documentation = "https://graphorigami.org/cli/builtins.html#@config";
