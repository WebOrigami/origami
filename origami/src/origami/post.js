import {
  args,
  isStringlike,
  isUnpackable,
  toPlainValue,
  toString,
  Tree,
} from "@weborigami/async-tree";

/**
 * POST data to the indicated URL.
 *
 * @param {string} url
 * @param {any} data
 */
export default async function post(url, data) {
  url = args.string(url, "Origami.post");
  let body;
  let headers;
  if (isUnpackable(data)) {
    data = await data.unpack();
  }
  if (Tree.isMaplike(data)) {
    const value = await toPlainValue(data);
    body = JSON.stringify(value);
    headers = {
      "Content-Type": "application/json",
    };
  } else if (isStringlike(data)) {
    body = toString(data);
    headers = {
      "Content-Type": "text/plain",
    };
  } else {
    body = data;
  }
  const response = await fetch(url, {
    method: "POST",
    body,
    headers,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to POST to ${url}. Error ${response.status}: ${response.statusText}`,
    );
  }
  return response.arrayBuffer();
}
