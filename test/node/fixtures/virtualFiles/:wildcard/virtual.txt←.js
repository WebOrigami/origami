export default function () {
  // @ts-ignore
  const graph = this;
  return `This text was returned for ${graph.params?.wildcard}`;
}
