/**
 * This is an analogue of Object.assign that destructively copies properties to
 * a target object -- but avoids invoking property getters. Instead, it copies
 * property descriptors over to the target object.
 *
 * @param {any} target
 * @param  {...any} sources
 */
export default function assignPropertyDescriptors(target, ...sources) {
  for (const source of sources) {
    const descriptors = Object.getOwnPropertyDescriptors(source);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor.value !== undefined) {
        // Simple value, copy it
        target[key] = descriptor.value;
      } else {
        // Getter and/or setter, copy the descriptor
        Object.defineProperty(target, key, descriptor);
      }
    }
  }
  return target;
}
