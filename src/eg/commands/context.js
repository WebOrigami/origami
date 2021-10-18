export default async function context(...keys) {
  return this.context.get(...keys);
}

context.usage = `context\tReturns the graph that invoked a metagraph`;
