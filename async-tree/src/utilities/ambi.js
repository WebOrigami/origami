export const AsyncFunction = async function () {}.constructor;

export const AsyncGeneratorFunction = Object.getPrototypeOf(
  async function* () {},
).constructor;

export const GeneratorFunction = Object.getPrototypeOf(
  function* () {},
).constructor;
