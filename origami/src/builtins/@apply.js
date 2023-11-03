/**
 * @this {import("@graphorigami/types").AsyncTree|null}
 */
export default async function apply(target, fn) {
  return fn.call(this, target);
}
