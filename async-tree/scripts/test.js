/** @returns {Promise<string>} */
export default async function (name) {
  return `Hello, ${await name}`;
}

export async function foo() {}
