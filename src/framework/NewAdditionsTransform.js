import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";

const childAdditions = Symbol("childAdditions");
const gettingChildAdditions = Symbol("gettingChildAdditions");
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
      this[inheritedAdditions] = undefined;
    }

    async additions() {
      const childAdditions = await this.childAdditions();
      const inherited = this[inheritedAdditions] || [];
      const allAdditions = [...childAdditions, ...inherited];
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

    async *allKeys() {
      const base = super.allKeys ?? super[Symbol.asyncIterator];
      yield* base?.call(this);
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

      // If the value is an explorable graph, add inherited additions.
      if (ExplorableGraph.isExplorable(value)) {
        const inheritableValues = await getInheritableValues(this);
        const peerValues = await getPeerValues(this, key);

        // TODO: See if ghost key itself exists.
        // TODO: prevent duplication of above ghostValue.
        // const ghostValue = await this.get(ghostKey);
        // if (ghostValue !== undefined) {
        //   ghostGraphs.push(ghostValue);
        // }

        // Treat peer additions as a form of inherited additions.
        value[inheritedAdditions] = inheritableValues
          ? [inheritableValues]
          : [];
        if (peerValues.length > 0) {
          value[inheritedAdditions].push(...peerValues);
        }
      }

      return value;
    }

    async matchAll(key) {
      // Default behavior just includes the value obtained by get(key).
      const value = await this.get(key);
      return value ? [value] : [];
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[childAdditions] = undefined;
      this[inheritedAdditions] = undefined;
    }
  };
}

async function getInheritableValues(graph) {
  let values = null;
  for await (const key of graph) {
    if (isInheritedAdditionKey(key)) {
      const value = await graph.get(key);
      if (values === null) {
        values = {};
      }
      values[key] = value;
    }
  }
  return values ? new ObjectGraph(values) : null;
}

async function getPeerValues(graph, graphKey) {
  const values = [];
  // A peer additions graph itself can't have peer values.
  if (!isPeerAdditionKey(graphKey)) {
    const peerAdditionsKey = `${graphKey}${peerAdditionsSuffix}`;
    const peerAdditions = (await graph.matchAll?.(peerAdditionsKey)) || [];
    values.push(...peerAdditions);
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
