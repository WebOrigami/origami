let promise;

/**
 * Lazy-load the jsdom library.
 *
 * Statically loading jsdom is slightly annoying. It's a large library that's
 * rarely used. It also executes non-trivial code at load time. That includes a
 * runtime test that (always?) throws an exception, which complicates debugging.
 */
export default async function loadJsDom() {
  promise ??= await import("jsdom");
  return promise;
}
