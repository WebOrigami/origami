#!/usr/bin/env node

import { Explorable } from "@explorablegraph/explorable";

const foo = (x) => `Foo said, "${x}."`;
const bar = (x) => `Bar said, "${x}."`;

const functions = Explorable.from({ foo, bar });

function getOutermostParenthesis(text) {
  const noMatch = { open: -1, close: -1 };
  let openParenIndex;
  let closeParenIndex;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "(":
        depth++;
        if (openParenIndex === undefined) {
          openParenIndex = i;
        }
        break;

      case ")":
        if (depth === 0) {
          // Hit a close parenthesis before an open parenthesis.
          return noMatch;
        }
        depth--;
        closeParenIndex = i;
        break;
    }
  }

  if (depth !== 0) {
    // Missing at least one close parenthesis.
    return noMatch;
  }

  return { open: openParenIndex, close: closeParenIndex };
}

// Given a string and a graph of functions, return a parsed tree.
async function parse(text, functions) {
  const trimmed = text.trim();
  const { open, close } = getOutermostParenthesis(trimmed);
  if (open === -1 || close === -1 || close !== trimmed.length - 1) {
    // Return the whole text.
    return text;
  }

  const fnText = trimmed.slice(0, open);

  // REVIEW
  // const fn = await functions[apply](fnText);
  // const fn = await functions[call](fnText);
  // const fn = await functions[get](fnText);
  const fn = await Explorable.call(functions, fnText);
  if (!fn) {
    // Function not found
    return null;
  }

  const argText = trimmed.substring(open + 1, close);
  const arg = await parse(argText, functions);

  return {
    arg,
    argText,
    fn,
    fnText,
    text,
  };
}

// Return an explorable constant: no keys, always returns obj.
function constant(obj) {
  return {
    [Symbol.asyncIterator]() {
      return [][Symbol.iterator]();
    },

    [Explorable.call](key) {
      return obj;
    },
  };
}

const text = "foo(bar(foo(Hello)))";
const parseTree = await parse(text, functions);
const explorableParseTree = Explorable.from(parseTree);
const result = await Explorable.reduce(explorableParseTree, async (map) => {
  // Since the expression only supports unary functions, we only expect one value.
  const { fn, arg } = map;
  return await Explorable.call(fn, arg);
});
console.log(result);
