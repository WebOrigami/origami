Please read the section on [Respectful open source participation](ReadMe.md#respectful-open-source-participation)

## Reporting bugs

Bug reports are welcome. Most bugs on the project have been reported in the [Web Origami room](https://matrix.to/#/%23weborigami:envs.net) on [Matrix](https://matrix.org). This is very beneficial to the project in two ways: 1) other users who wouldn't normally monitor the GitHuba Issues area can contribute suggestions, and 2) bug reports or feature suggestions can be firmed up more interactively. In many cases the discussion leads to a better outcome that might have ensued with the semi-formal structure of a GitHub Issue.

### Identifying a minimal reproduction case

Investigating and diagnosing a bug can take a great deal of time. Moreover, it's often hard to understand an Origami bug outside the context of your (potentially large and complex) project. A bug report saying, "I get this error: <insert error message>" _may_ be enough to understand the problem. But if the bug depends on your project infrastructure, it may be possible to diagnose it without cloning your project, installing its dependencies, then running the project to see what's happening. That all takes considerable time.

To the extent you want to contribute to the Origami project, the simplest and most direct way you can help is to invest time reducing bug reports to the small possible case that reproduces the bug.

The very best bug reports identify **two** conditions: one that works as expected and one that doesn’t, where _the difference between the two is as small as possible_.

Suppose you do `npm run build` and get an error: `Bad thing happened in src/site.ori`. Before reporting this error, try to isolate it:

- If the error just appeared after your most recent edit, save your work, undo that edit, and try to recover the working state you recently had. It's much easier to track things down if you can figure out the specific line(s) you changed that made the problem.
- If you only discover the error after having made a bunch of changes, you may still be able to isolate the problem by working either forward from a known good state or working backward from the broken state.
- If you discover the error after having made a giant pile of changes, another strategy is to create a new file (in the case, a copy of `site.ori`).
- If the error is happening the first time you try an Origami feature (perhaps a builtin function you haven't used before), try reproducing an example from the Origami documentation. If you can't get the example to work, that's an extremely valuable data point.

Once you can identify two conditions — the good one that works, the bad one that doesn't — the next step is to shrink the difference between them. Your goal is to box the bug into the smallest possible space.

1. If (in this example) your `site.ori` file does many things, in the bad version of the file, comment out the lines that seem to be triggering the bug and confirm the site builds without error.
1. Now identify _other_ lines that you believe are irrelevant to the bug. If you comment out the suspected buggy lines, the site should build; if you uncomment them, the build should fail — 

1. Now start reducing the difference between those conditions: try replacing the working `changes` with `Dev.changes`; try adding the parenthesis; etc.
1. At some point you will see the typo

If the problem here hadn’t been a typo, you could keep going: rewrite the sample .yaml file data as .ori files, rename `oldTree.yaml` to `oldTree.ori`, then eventually to `build-old`, etc. You want to work step-by-step to bring the good condition and bad conditions closer together. Eventually you will identify some tiny change that triggers the problem.

In the vast majority of cases, trying to identify the smallest breaking change will reveal what the actual mistake is. And in the event you’ve found a bug, you’ve dramatically reduced the area where the problem could lie.

## Developing

Before embarking on a non-trivial feature idea, it's a good idea to solicit feedback from someone. Contacting [Jan Miksovsky](https://jan.miksovsky.com) or posting on the [Web Origami room](https://matrix.to/#/%23weborigami:envs.net) are good places to start.

### Setup

Clone this repository, then install dependencies with:

```console
$ npm install
```

### Unit tests

Run unit tests:

```console
$ npm t
```

Please include unit tests for new features. It's not necessary to exhaustively cover every condition, but do cover the core functionality.

### Type checking

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
