/**
 * The `!` built-in returns `undefined`, and is intended for force function
 * invocation in the shell without requiring the use of parentheses. Parentheses
 * can't be used in the shell without quoting them, which is inconvenient.
 *
 * This parentheses form:
 *
 * ```
 * $ ori "fn1.js(fn2.js())"
 * ```
 *
 * Can be written as:
 *
 * ```
 * $ ori fn1.js fn2.js !
 * ```
 *
 * This forces the invocation of `fn2.js`, passing `undefined` as the argument.
 * The result of that invocation is then passed to `fn1.js`.
 */
export default undefined;
