/**
 * This module is used to let the dev:watch builtin tell ImportModulesMixin when
 * it should reset its module cache-busting timestamp.
 */

let timestamp = Date.now();

export function getTimestamp() {
  return timestamp;
}

export function resetTimestamp() {
  timestamp = Date.now();
}
