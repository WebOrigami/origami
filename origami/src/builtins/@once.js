const fnPromiseMap = new WeakMap();

export default async function once(fn) {
  if (!fnPromiseMap.has(fn)) {
    fnPromiseMap.set(fn, fn.call(this));
  }
  return fnPromiseMap.get(fn);
}
