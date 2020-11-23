# Explorable functions in JavaScript

This folder contains information about using explorable functions in the JavaScript programming language.

Explorable functions (exfns) were initially designed for use in web software development, and so the first audience of this work is aimed at browser-based or Node-based software. As a result, the packages in this repository are generally written in JavaScript and aimed at JavaScript developers (as well as developers in derivative languages, particularly TypeScript).

That said, the [concept](../Concepts/ReadMe.md) of explorable functions and its related primitives are abstract, and useful in other programming languages such as the proposed [exl](../exl/ReadMe.md) language.

## Representing explorable functions in JavaScript

The API design which follows is meant to be as idiomatic to JavaScript as possible — leveraging native features of the language in a way consistent with their intended use. While the API does take advantage of JavaScript features which are somewhat advanced, and may not yet be familiar to you, they are nevertheless useful features of the language. If you learn these features for the purpose of using explorable functions in JavaScript, you will also learn, as a consequence, aspects of the language which you can productively use elsewhere in your career.

## Duck typing of explorable functions

Explorable functions in JavaScript are recognized by "duck typing": an object is determined to be an explorable function by inspecting the presence of certain methods, rather than by inspecting the type of the object itself. There is an `Explorable` base class used to work with explorable functions, and many explorable functions will be `instanceof Explorable`, but many will not.

This design is intended to facilitate the adaptation of existing JavaScript classes into the explorable graph ecosystem. By adding the required characteristics (below), you can turn almost any class you already have into an explorable function. In the relatively rare case your class' existing implementation happens to be incompatible with the explorable function model, you can provide a wrapper. (See below.)

## Required characteristics of explorable functions

All explorable functions in JavaScript are recognized by the presence of two methods identified with `Symbol` objects:

1. An iterator identified with `[Symbol.iterator]` or `[Symbol.asyncIterator]` that returns the explorable function's public keys. Those symbols are both built into JavaScript already.
2. A call method identified with `[Explorable.call]` or `[Explorable.asyncCall]` that can be given a key to obtain a result. Those symbols are new, and defined by the `Explorable` class in the "@explorablegraph/explorable" package. The Explorable Graph project is interested in pursuing a [JavaScript Proposal](./JavaScript%20Proposal.md) to add compatible symbols to the JavaScript language.

If an explorable function wishes to be treated as an explorable graph, it can do so by providing a third recognizable characteristic (see below).

As noted above, explorable functions come in sync and async flavors.

## Synchronous explorable functions

Synchronous explorable functions expose a `[Explorable.call]` method which takes a single parameter called the `key`. Invoking this method

```js
const exfn = {
  [Symbol.iterator]() {
    return ['a'];
  }
  [Explorable.call](key) {
    return key === 'a' ? 'A' : undefined;
  }
}

// Writes "a: A" to the console.
for (const key in exfn) {
  const value = exfn[Explorable.call](key);
  console.log(`${key}: ${value}`);
}
```

## Asynchronous explorable functions

The initial applications of exfns in JavaScript is for file-based tools, web server development, and client-side web page code — all of which generally need asynchronous behavior.

```js
const exfn = {
  async *[Symbol.asyncIterator]() {
    yield* ['a'];
  }
  [Explorable.asyncCall](key) {
    return key === 'a' ? 'A' : undefined;
  }
}

// Writes "a: A" to the console. Note the uses of the await keyword.
for await (const key in exfn) {
  const value = await exfn[Explorable.asyncCall](key);
  console.log(`${key}: ${value}`);
}
```

## Explorable graphs

[get] and [asyncGet]
If an object supports [asyncGet], it indicates that it wants to be treated as a graph

## ExFn.traverse(exfn, path)

where path is an array of keys

functions are called, take the path as arguments:

```js
value = await exfn[asyncCall](path);
```

graphs are traversed, get the value with the first key

```js
value = await exfn[asyncGet](path[0]);
```

if value is exfn, traverse it with the remaining path, otherwise return it

## Wrapping existing objects in an explorable function

If an object already happens to support [Symbol.iterator] or [Symbol.asyncIterator] whose existing implementation cannot be changed and which is incompatible with the definition of an explorable function, you wrap the object.

E.g., Map
