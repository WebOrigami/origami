import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";

const childAdditions = Symbol("childAdditions");
const gettingChildAdditions = Symbol("gettingChildAdditions");
// const peerAdditions = Symbol("peerAdditions");
const inheritedAdditions = Symbol("inheritedAdditions");

export const additionsPrefix = "+";
export const inheritedAdditionsPrefix = "…";
export const peerAdditionsSuffix = "+";

export default function NewAdditionsTransform(Base) {
  return class NewAdditions extends Base {
    constructor(...args) {
      super(...args);
      this[childAdditions] = undefined;
      this[gettingChildAdditions] = false;
      // this[peerAdditions] = undefined;
      this[inheritedAdditions] = undefined;
    }

    async additions() {
      const childAdditions = await this.childAdditions();
      // // const peerAdditions = await this.peerAdditions();
      const inheritedAdditions = await this.inheritedAdditions();
      const allAdditions = [
        ...childAdditions,
        // ...peerAdditions,
        ...inheritedAdditions,
      ];
      return allAdditions.length === 0
        ? null
        : allAdditions.length === 1
        ? allAdditions[0]
        : new Compose(...allAdditions);
    }

    async childAdditions() {
      if (this[childAdditions] === undefined) {
        // To avoid an infinite loop, we set a flag to indicate that we're in
        // the process of getting additions. During that process, the get method
        // will be able to get other things, but not additions.
        this[gettingChildAdditions] = true;
        this[childAdditions] = [];
        for await (const key of super[Symbol.asyncIterator]()) {
          if (isChildAdditionKey(key)) {
            const addition = await this.get(key);
            if (addition) {
              const graph = ExplorableGraph.from(addition);
              this[childAdditions].push(graph);
            }
          }
        }
        this[gettingChildAdditions] = false;
      }
      return this[childAdditions];
    }

    async *[Symbol.asyncIterator]() {
      yield* super[Symbol.asyncIterator]();
      const additions = await this.additions();
      if (additions) {
        yield* additions;
      }
    }

    async get(key) {
      let value = await super.get(key);
      if (
        value === undefined &&
        !isChildAdditionKey(key) &&
        !this[gettingChildAdditions]
      ) {
        // Not found locally, check additions.
        const additions = await this.additions();
        value = await additions?.get(key);
      }

      // TODO: add inherited additions
      // both … additions and foo+ additions
      if (ExplorableGraph.isExplorable(value)) {
        const inheritedAdditions = [];

        if (!isPeerAdditionKey(key)) {
          const ghostKey = `${key}${peerAdditionsSuffix}`;

          // See if ghost key itself exists.
          const ghostValue = await this.get(ghostKey);
          if (ghostValue !== undefined) {
            ghostGraphs.push(ghostValue);
          }

          // Add ghost graphs from local formulas.
          // TODO: prevent duplication of above ghostValue.
          const ghostResults = await this.formulaResults?.(ghostKey);
          if (ghostResults) {
            ghostGraphs = ghostGraphs.concat(ghostResults);
          }

          if (!("ghostGraphs" in value)) {
            value = transformObject(GhostValuesTransform, value);
          }

          value[inheritedAdditions] = inheritedAdditions;
        }
      }

      return value;
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[childAdditions] = undefined;
      // this[peerAdditions] = undefined;
      this[inheritedAdditions] = undefined;
    }
  };
}

async function inheritableValues(graph) {
  const values = [];
  for await (const key of graph) {
    if (isInheritedAdditionKey(key)) {
      const value = await graph.get(key);
      values.push(value);
    } else {
      const peerAdditionsKey = `${key}${peerAdditionsSuffix}`;
      if (key === peerAdditionsKey) {
        const value = await graph.get(key);
        values.push(value);
      }
    }
  }
  return values;
}

function isChildAdditionKey(key) {
  return key.startsWith?.(additionsPrefix);
}

function isInheritedAdditionKey(key) {
  return key.startsWith?.(inheritedAdditionsPrefix);
}

function isPeerAdditionKey(key) {
  return key.endsWith?.(peerAdditionsSuffix);
}
