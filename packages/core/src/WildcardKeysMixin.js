import Compose from "./Compose.js";
import ExplorableGraph from "./ExplorableGraph.js";

const wildcardPrefix = ":";

export default function WildcardKeysMixin(Base) {
  return class WildcardKeys extends Base {
    // async *[Symbol.asyncIterator]() {
    //   // Yield keys that aren't wildcard keys.
    //   for await (const key of super[Symbol.asyncIterator]()) {
    //     if (!isWildcardKey(key)) {
    //       yield key;
    //     }
    //   }
    // }

    async get(key, ...rest) {
      let bindTarget = this;
      const explorableValues = [];

      // Try key directly.
      let value = await super.get(key);

      if (value === undefined || value instanceof ExplorableGraph) {
        // Consider all wildcards.
        if (value instanceof ExplorableGraph) {
          explorableValues.push(value);
        }
        for await (const wildcardKey of this.wildcards()) {
          if (wildcardKey !== key) {
            // We have a wildcard that matches.
            const wildcardValue = await super.get(wildcardKey);
            if (wildcardValue !== undefined) {
              if (wildcardValue instanceof ExplorableGraph) {
                const parameterized = parameterize(
                  wildcardValue,
                  wildcardKey,
                  key
                );
                explorableValues.push(parameterized);
              } else if (explorableValues.length === 0) {
                // First wildcard found is not explorable; use that value.
                value = wildcardValue;
                bindTarget = parameterize(this, wildcardKey, key);
                break;
              }
            }
          }
        }

        if (explorableValues.length > 0) {
          value =
            explorableValues.length > 1
              ? Reflect.construct(this.constructor, [
                  new Compose(...explorableValues),
                ])
              : explorableValues[0];
        }
      }

      if (value instanceof Function) {
        // Bind the function to the graph.
        value = await value.call(bindTarget, ...rest);
      } else if (value instanceof ExplorableGraph && rest.length > 0) {
        value = await value.get(...rest);
      }

      return value;
    }

    get params() {
      return {};
    }

    async *wildcards() {
      for await (const key of super[Symbol.asyncIterator]()) {
        if (isWildcardKey(key)) {
          yield key;
        }
      }
    }
  };
}

function isWildcardKey(key) {
  return key.startsWith(wildcardPrefix);
}

function parameterize(obj, wildcard, match) {
  const wildcardName = wildcard.slice(1);
  const params = Object.assign({}, obj.params, {
    [wildcardName]: match,
  });
  return Object.create(obj, {
    params: {
      config: true,
      enumerable: false,
      value: params,
    },
  });
}
