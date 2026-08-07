import DebugParentSession from "./DebugParentSession.js";

/**
 * Start a new debug parent server for the given Origami expression and runtime
 * state.
 *
 * This function will start a child server that evaluates the given expression
 * with the given parent path. This arrangement ensures the expression is
 * evaluated in a clean Node context (not polluted by previous evaluations). The
 * parent server proxies requests to the child server.
 *
 * The debug parent monitors the parent tree for changes, and restarts the child
 * whenever files in the parent tree change.
 *
 * Supported `options`:
 * - `expression` (required): the Origami expression to evaluate in the child
 *   process
 * - `parentPath` (required): the path to the parent tree used for evaluation
 *
 * The returned `emitter` is an EventEmitter that emits "error" events when the
 * child server encounters an Origami error while handling a request.
 *
 * @param {Object} options
 * @param {string} options.expression
 * @param {string} options.parentPath
 * @param {number} [options.port]
 * @param {boolean} [options.quiet]
 */
export default async function debugParent(options) {
  const session = new DebugParentSession(options);
  return session.start();
}
