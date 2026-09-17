import AsyncMap from "../drivers/AsyncMap.js";

export function allSync(...args) {
  return args.every(isSync);
}

export const AsyncFunction = async function () {}.constructor;

export const AsyncGeneratorFunction = Object.getPrototypeOf(
  async function* () {},
).constructor;

export const GeneratorFunction = Object.getPrototypeOf(
  function* () {},
).constructor;

export function isSync(object) {
  if (
    object instanceof AsyncMap ||
    object instanceof AsyncFunction ||
    object instanceof AsyncGeneratorFunction ||
    object instanceof Promise
  ) {
    return false;
  }
  return true;
}
