import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a graph with the indicated keys (if provided).
 *
 * The pattern can a string with a simplified pattern syntax that tries to match
 * against the entire key and uses brackets to identify named wildcard values.
 * E.g. `[name].html` will match `Alice.html` with wildcard values { name:
 * "Alice" }.
 *
 * The pattern can also be a JavaScript regular expression.
 *
 * If a key is requested, match against the given pattern and, if matches,
 * incorporate the matched pattern's wildcard values into the scope and invoke
 * the indicated function to produce a result.
 *
 * @param {string|RegExp} pattern
 * @param {Invocable} resultFn
 * @param {GraphVariant} [keys]
 * @this {Explorable}
 */
export default function match(pattern, resultFn, keys = []) {
  assertScopeIsDefined(this);
  let regex;
  if (typeof pattern === "string") {
    // Convert the simple pattern format into a regular expression.
    const regexText = pattern.replace(
      /\[(?<variable>.+)\]/g,
      (match, p1, offset, string, groups) => `(?<${groups.variable}>.+)`
    );
    regex = new RegExp(`^${regexText}$`);
  } else if (pattern instanceof RegExp) {
    regex = pattern;
  } else {
    throw new Error(`match(): Unsupported pattern`);
  }

  // Remember the scope used to invoke this function so we can extend it below.
  const scope = this;

  return {
    async get(key) {
      const keyMatch = regex.exec(key);
      if (!keyMatch) {
        return undefined;
      }

      if (
        typeof resultFn !== "function" &&
        !(ExplorableGraph.isExplorable(resultFn) && "parent" in resultFn)
      ) {
        // Simple return value; return as is
        return resultFn;
      }

      // If the pattern contained named wildcards, extend the scope. It appears
      // that the `groups` property of a match is *not* a real plain object, so
      // we have to make one.
      const bindings = keyMatch.groups
        ? Object.fromEntries(Object.entries(keyMatch.groups))
        : null;
      const fnScope = bindings ? new Scope(bindings, scope) : scope;

      // Invoke the result function with the extended scope.
      let value;
      if (typeof resultFn === "function") {
        value = await resultFn.call(fnScope);
      } else {
        value = Object.create(resultFn);
        value.parent = fnScope;
      }

      return value;
    },

    async keys() {
      return typeof keys === "function" ? await keys.call(scope) : keys;
    },
  };
}

match.usage = `match <pattern>, <fn>, [<keys>]\tMatches simple patterns or regular expressions`;
match.documentation = "https://graphorigami.org/cli/builtins.html#match";
