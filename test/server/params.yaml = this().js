// Demonstrate retrieval of URL search params.
export default async function () {
  const params = await this.get("@params");
  return params;
}
