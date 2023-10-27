import * as Tree from "./Tree.js";

/**
 * The .keys.json file format lets a site expose the keys of nodes in the site
 * tree so that they can be read by SiteTree.
 *
 * This file format is a JSON array of key descriptors, which are strings that
 * are either a key for a regular value like "foo", or a key with a trailing
 * slash like "bar/" that indicate a subtree.
 */
export default {
  /**
   * Process the JSON in a .keys.json file.
   *
   * This returns a flat dictionary of flags which are true for subtrees and
   * false otherwise.
   *
   * Example: the JSON `["foo","bar/"]` parses as:
   *
   *   {
   *     foo: false,
   *     bar: true,
   *   }
   */
  parse(json) {
    const descriptors = JSON.parse(json);
    const result = {};
    for (const descriptor of descriptors) {
      if (descriptor.endsWith("/")) {
        result[descriptor.slice(0, -1)] = true;
      } else {
        result[descriptor] = false;
      }
    }
    return result;
  },

  /**
   * Given a tree node, return a JSON string that can be written to a .keys.json
   * file.
   */
  async stringify(treelike) {
    const tree = Tree.from(treelike);
    const keyDescriptors = [];
    for (const key of await tree.keys()) {
      // Skip the key .keys.json if present.
      if (key === ".keys.json") {
        continue;
      }
      const isKeyForSubtree = await Tree.isKeyForSubtree(tree, key);
      const keyDescriptor = isKeyForSubtree ? `${key}/` : key;
      keyDescriptors.push(keyDescriptor);
    }
    const json = JSON.stringify(keyDescriptors);
    return json;
  },
};
