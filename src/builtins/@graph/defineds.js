import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return only the defined (not `undefined`) values in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default async function defineds(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this.get("@current"));
  if (variant === undefined) {
    throw new TypeError("A graph variant is required");
  }
  return ExplorableGraph.mapReduce(variant, null, (values, keys) => {
    const result = {};
    let someValuesExist = false;
    for (let i = 0; i < keys.length; i++) {
      const value = values[i];
      if (value != null) {
        someValuesExist = true;
        result[keys[i]] = values[i];
      }
    }
    return someValuesExist ? result : null;
  });
}
