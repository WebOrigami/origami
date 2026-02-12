/**
 * Error class thrown by Tree.traverseOrThrow()
 */
export default class TraverseError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "TraverseError";
    this.cause = options.cause;
    this.head = options.head;
    this.lastValue = options.lastValue;
    this.keys = options.keys;
    this.position = options.position;
  }
}
