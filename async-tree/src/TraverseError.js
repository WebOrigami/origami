/**
 * Error class thrown by Tree.traverseOrThrow()
 */
export default class TraverseError extends ReferenceError {
  constructor(message, options) {
    super(message);
    this.name = "TraverseError";
    Object.assign(this, options);
  }
}
