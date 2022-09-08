/**
 * Demonstrate retrieval of URL search params.
 * @this {Explorable}
 */
export default async function () {
  const params = await this.get("@params");
  return params;
}
