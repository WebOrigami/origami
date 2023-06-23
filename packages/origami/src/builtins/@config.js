import project from "./@project.js";

/**
 * Return the configuration for the current project.
 *
 * If the project's root defines an ori.config.js file, the configuration is
 * the default export of that file. Otherwise, the configuration is the set of
 * built-in functions.
 *
 * @this {Explorable|null}
 * @param {any} [key]
 */
export default async function config(key) {
  const projectGraph = await project.call(this);
  const scope = projectGraph?.parent;
  if (!scope) {
    return undefined;
  }
  return key === undefined ? scope : scope.get(key);
}

config.usage = `@config\tThe current project's configuration graph`;
config.documentation = "https://graphorigami.org/language/@config.html";
