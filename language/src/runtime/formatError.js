/**
 *
 * @param {Error} error
 */
export default function formatError(error) {
  // let message = "";
  // Work up to the root cause, displaying intermediate messages as we go up.
  // while (error) {
  let message = error.toString();
  let location = /** @type {any} */ (error).location;
  if (location) {
    // If the location just has start and end offsets, we'll need to compute a
    // more useful location with line and column numbers.
    // if (
    //   typeof location.start === "number" &&
    //   typeof location.end === "number"
    // ) {
    //   location = peg$computeLocation(location.start, location.end);
    // }
    let { source, start, end } = location;
    const fragment = source.text.slice(start.offset, end.offset);
    message += `\n${fragment}`;
    if (typeof source === "object" && source.url) {
      message += `\n${source.url.href}:${start.line}:${start.column}`;
    }
  }
  // @ts-ignore
  //   error = error.cause;
  // }
  // if (error.stack) {
  //   // Display stack trace for root cause, under the theory that that's the most
  //   // useful place to look for the problem.
  //   console.error(error.stack);
  // }
  return message;
}
