import {
  isStringLike,
  isUnpackable,
  toPlainValue,
  toString,
  Tree,
} from "@weborigami/async-tree";

/**
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {string} url
 * @param {any} data
 */
export default async function post(url, data) {
  let body;
  let headers;
  if (isUnpackable(data)) {
    data = await data.unpack();
  }
  if (Tree.isTreelike(data)) {
    const value = await toPlainValue(data);
    body = JSON.stringify(value);
    headers = {
      "Content-Type": "application/json",
    };
  } else if (isStringLike(data)) {
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
      `Failed to POST to ${url}. Error ${response.status}: ${response.statusText}`
    );
  }
  return response.arrayBuffer();
}
post.description = "post(url, data) - POST the given data to the URL";
