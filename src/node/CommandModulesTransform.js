import path from "path";

/***
 * This mixin is a companion to ImplicitModulesTransform.
 *
 * ImplicitModulesTransform takes care of loading "foo.js" if a request to load
 * "foo" fails, then returning that module's export as a result. What that mixin
 * doesn't do is expose "foo" as a key, since that might not be desired in cases
 * like a server, which has no need to expose such internal functions on things
 * like a default index page.
 *
 * One case where we *do* want to expose such keys is as commands in the scope
 * used by the eg shell. This mixin takes care of that: if a folder contains
 * "foo.js", then this will expose "foo" as a key.
 *
 * As a side effect, however, this suppresses all other keys. The eg shell scope
 * only wants to consider commands.
 */
export default function CommandsModulesTransform(Base) {
  return class CommandModules extends Base {
    async *[Symbol.asyncIterator]() {
      for await (const key of super[Symbol.asyncIterator]()) {
        // If we find something like "foo.js", then yield "foo" as a key.
        if (key.endsWith(".js")) {
          yield path.basename(key, ".js");
        }
      }
    }
  };
}
