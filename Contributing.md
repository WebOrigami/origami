Please read the section on [Respectful open source participation](ReadMe.md#respectful-open-source-participation)

Before embarking on a non-trivial feature idea, it's a good idea to solicit feedback from someone. Contacting [Jan Miksovsky](https://jan.miksovsky.com) or posting on the [Web Origami room](https://matrix.to/#/%23weborigami:envs.net) are good places to start.

## Setup

Clone this repository, then install dependencies with:

```console
$ npm install
```

## Unit tests

Run unit tests:

```console
$ npm t
```

Please include unit tests for new features. It's not necessary to exhaustively cover every condition, but do cover the core functionality.

## Type checking

The project uses TypeScript for type checking:

```console
$ npm run typecheck
```

TypeScript will detect spurious problems in two dependencies outside our control: `graphviz-wasm` and `watcher`. For now, ignore problems in those dependencies. Beyond that, please try to fix type errors before submitting.

## Documentation

Creating documentation for new features is one of the most time-consuming aspects of the project. If you're adding or changing an end-user visible feature, please consider submitting a separate pull request on the [docs](https://github.com/WebOrigami/docs) repository.

If you don't like your own writing, aren't comfortable writing in English, or for some other reason don't feel comfortable writing documentation, no worries! 😅

But if you can write all, it really will help the project. Even a rough draft is a big help.

Above all, please give some thought to creating focused and meaningful code samples for the separate [samples](https://github.com/WebOrigami/samples) repository. These are incorporated into the documentation. It makes all the difference to a reader to see a good demonstration of a feature, particularly if the demo is as small as possible -- i.e., doesn't require first understanding many other features.

It's ideal if the code sample isn't all `foo(bar)` code and instead includes meaningful names or concepts that might realistcally come up in the practice of making websites. That said, some _working_ code samples are better than none.

## Developing in the context of your own project

By design, Origami can be easily extended by writing JavaScript functions and [calling the function from a template](https://weborigami.org/language/templates.html#call-your-own-javascript-functions) or some other Origami expression. Many features built into Origami were first implemented as a plain JavaScript function in a test project before being migrated to the main repository.

Exploring a new feature idea in the context of your own Origami project can be beneficial:

- At a minimum, you'll get the feature you want
- You'll know that the feature works for your own, real project
- You'll almost certainly encounter practical challenges in the context of your real project that will raise important design questions
- Pros and cons of the feature can be explored in the context of a functional project instead of debating the idea in the abstract
- It is easier to develop a feature in relative isolation before trying to integrate it into the Origami monorepo
