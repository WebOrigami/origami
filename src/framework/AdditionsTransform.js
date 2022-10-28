import MergeGraph from "../common/MergeGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import KeysTransform from "./KeysTransform.js";

const additions = Symbol("additions");
const childAdditions = Symbol("childAdditions");
const inheritedAdditions = Symbol("inheritedAdditions");
const inheritableAdditions = Symbol("inheritableAdditions");
const addedPeerAdditions = Symbol("addedPeerAdditions");
const gettingChildAdditions = Symbol("gettingChildAdditions");
// We used to define peerAdditions as a Symbol as well, but there seem to be
// cases where Node loads two copies of this transform. One presumably is loaded
// by the CLI, and the other is loaded later via a dynamic import. It's unclear
// why they don't share the same copy of this module. In any event,
// peerAdditions is the one property that's used to communicate between a parent
// and a child, and the parent and child may be using a different copy of this
// transform. To let them communicate, we define peerAdditions with a regular
// string name.

export const additionsPrefix = "+";
export const inheritableAdditionsPrefix = "…";
export const peerAdditionsSuffix = "+";

export default function AdditionsTransform(Base) {
  return class Additions extends Base {
    constructor(...args) {
      super(...args);
      this[additions] = undefined;
      this[childAdditions] = undefined;
      this[inheritedAdditions] = undefined;
      this[inheritableAdditions] = undefined;
      this.peerAdditions = undefined;
      this[addedPeerAdditions] = undefined;
      this[gettingChildAdditions] = false;
    }

    async additions() {
      if (this[additions] === undefined) {
        await this.ensureKeys();
        const children = this[childAdditions] ?? [];
        const peers = this.peerAdditions ?? [];
        const allAdditions = [...children, ...peers];
        this[additions] =
          allAdditions.length === 0
            ? null
            : allAdditions.length === 1
            ? allAdditions[0]
            : new MergeGraph(...allAdditions);
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
        if (!this.peerAdditions && !this[gettingChildAdditions]) {
          await this.getKeys();
        }
        // Preserve any peer additions on the value that were set by its
        // containing graph as it was passed up to us.
        const existingPeerAdditions = value.peerAdditions ?? [];
        const localPeerAdditions = await getPeerValues(this, key);
        value.peerAdditions = [...existingPeerAdditions, ...localPeerAdditions];
      }

      return value;
    }

    async getKeys() {
      this[childAdditions] = [];
      if (!this.peerAdditions) {
        this.peerAdditions = [];
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
          /** @type {any} */
          const graph = ExplorableGraph.from(addition);
          graph.applyFormulas = false;
          graph.parent = null;
          this[childAdditions].push(graph);
          for (const graphKey of await KeysTransform.realKeys(graph)) {
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
        for (const peerGraph of this.peerAdditions ?? []) {
          for (const peerKey of await KeysTransform.realKeys(peerGraph)) {
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

    // Reset memoized values when the underlying graph changes.
    onChange(key) {
      super.onChange?.(key);
      this[additions] = undefined;
      this[childAdditions] = undefined;
      this[inheritedAdditions] = undefined;
      this[inheritableAdditions] = undefined;
      this.peerAdditions = undefined;
      this[addedPeerAdditions] = undefined;
      this[gettingChildAdditions] = false;
    }
  };
}

async function getPeerValues(graph, graphKey) {
  const values = [];
  // A child or peer additions graph itself can't have peer values.
  if (!isChildAdditionKey(graphKey) && !isPeerAdditionKey(graphKey)) {
    const peerAdditionsKey = `${graphKey}${peerAdditionsSuffix}`;

    // See if the peer addition key by itself ("foo+") exists. We can limit our
    // search to real keys, since we'll use formulas to match virtual keys in
    // the next step.
    const realKeys = await graph.realKeys();
    if (realKeys.includes(peerAdditionsKey)) {
      const value = await graph.get(peerAdditionsKey);
      if (value) {
        value.applyFormulas = false;
        value.parent = null;
        values.push(value);
      }
    }

    const matches = (await graph.matchAll?.(peerAdditionsKey)) || [];
    const peerGraphs = matches.map((match) => {
      /** @type {any} */
      const peerGraph = ExplorableGraph.from(match);
      peerGraph.applyFormulas = false;
      peerGraph.parent = null;
      return peerGraph;
    });
    values.push(...peerGraphs);
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
