import Compose from "../common/Compose.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { realKeys } from "./KeysTransform.js";

const additions = Symbol("additions");
const childAdditions = Symbol("childAdditions");
const inheritedAdditions = Symbol("inheritedAdditions");
const inheritableAdditions = Symbol("inheritableAdditions");
const peerAdditions = Symbol("peerAdditions");
const addedPeerAdditions = Symbol("addedPeerAdditions");
const gettingChildAdditions = Symbol("gettingChildAdditions");

export const additionsPrefix = "+";
export const inheritableAdditionsPrefix = "…";
export const peerAdditionsSuffix = "+";

export default function AdditionsTransform(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[childAdditions] = undefined;
      this[inheritedAdditions] = undefined;
      this[inheritableAdditions] = undefined;
      this[peerAdditions] = undefined;
      this[addedPeerAdditions] = undefined;
      this[gettingChildAdditions] = false;
    }

    async additions() {
      if (this[additions] === undefined) {
        if (!this[childAdditions] || !this[peerAdditions]) {
          await this.getKeys();
        }
        const children = this[childAdditions] ?? [];
        const peers = this[peerAdditions] ?? [];
        const allAdditions = [...children, ...peers];
        this[additions] =
          allAdditions.length === 0
            ? null
            : allAdditions.length === 1
            ? allAdditions[0]
            : new Compose(...allAdditions);
      }
      return this[additions];
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

      if (ExplorableGraph.isExplorable(value)) {
        // Add peer additions.
        if (!this[gettingChildAdditions]) {
          await this.getKeys();
        }
        value[peerAdditions] = await getPeerValues(this, key);
      }

      return value;
    }

    async getKeys() {
      this[childAdditions] = [];
      if (!this[peerAdditions]) {
        this[peerAdditions] = [];
      }
      await super.getKeys();
    }

    async keyAdded(key, options, existingKeys) {
      const result = (await super.keyAdded?.(key, options, existingKeys)) ?? {};
      if (isChildAdditionKey(key)) {
        // To avoid an infinite loop, we set a flag to indicate that we're in
        // the process of getting additions. During that process, the get method
        // will be able to get other things, but not additions.
        this[gettingChildAdditions] = true;
        const addition = await this.get(key);
        this[gettingChildAdditions] = false;
        if (addition) {
          const graph = ExplorableGraph.from(addition);
          graph.applyFormulas = false;
          graph.parent = null;
          this[childAdditions].push(graph);
          for (const graphKey of await realKeys(graph)) {
            this.addKey(graphKey);
          }
        }
        // Hide this addition from the public keys.
        result.hidden = true;
      } else if (isInheritableAdditionKey(key)) {
        if (!this[inheritableAdditions]) {
          this[inheritableAdditions] = [];
        }
        this[inheritableAdditions].push(key);
      } else if (isPeerAdditionKey(key)) {
        result.hidden = true;
      }
      return result;
    }

    async keysAdded(keys) {
      await super.keysAdded?.(keys);

      // After the first cycle of keys have been added, add keys from any
      // pending peer additions that were passed down to use from the parent.
      if (!this[addedPeerAdditions]) {
        for (const peerGraph of this[peerAdditions]) {
          for (const peerKey of await realKeys(peerGraph)) {
            this.addKey(peerKey, { source: peerGraph });
          }
        }

        if (!this[inheritedAdditions]) {
          this[inheritedAdditions] = this.parent?.[inheritableAdditions] ?? [];
          for (const inheritedKey of this[inheritedAdditions]) {
            this.addKey(inheritedKey);
          }
        }

        this[addedPeerAdditions] = true;
      }
    }

    // This transform provides a default implentation of the matchAll method,
    // but in typical use the implementation provided by FormulasTransform will
    // be used instead.
    async matchAll(key) {
      const value = await this.get(key);
      return value ? [value] : [];
    }

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[childAdditions] = undefined;
      this[peerAdditions] = undefined;
    }
  };
}

async function getPeerValues(graph, graphKey) {
  const values = [];
  // A peer additions graph itself can't have peer values.
  if (!isPeerAdditionKey(graphKey)) {
    const peerAdditionsKey = `${graphKey}${peerAdditionsSuffix}`;

    // See if the peer addition key by itself ("foo+") exists. We can limit our
    // search to real keys, since we'll use formulas to match virtual keys in
    // the next step.
    // const realKeys = await graph.realKeys();
    // if (realKeys.includes(peerAdditionsKey)) {
    const value = await graph.get(peerAdditionsKey);
    if (value) {
      value.applyFormulas = false;
      value.parent = null;
      values.push(value);
    }
    // }

    const peerAdditions = (await graph.matchAll?.(peerAdditionsKey)) || [];
    peerAdditions.forEach((peerGraph) => {
      peerGraph.applyFormulas = false;
      peerGraph.parent = null;
    });
    values.push(...peerAdditions);
  }
  return values;
}

function isChildAdditionKey(key) {
  return key.startsWith?.(additionsPrefix);
}

function isInheritableAdditionKey(key) {
  return key.startsWith?.(inheritableAdditionsPrefix);
}

function isPeerAdditionKey(key) {
  return key.endsWith?.(peerAdditionsSuffix);
}
