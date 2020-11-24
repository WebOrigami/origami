# Some things which are similar

We do a lot of work with:

- JavaScript objects: { name: "Jane" }
- Files: /Users/jane/Documents/Hello.doc
- Web pages: https://example.com/about

These have some common properties:

- Each generally forms a hierarchical tree-like
- Sometimes the tree can contain cycles, so they're really graphs
- Each child node has a name
- These names form a path
- At the end of the path, we get something (an object, file, or page)

And they have some differences:

- They have different historical legacies
- Different latencies:
  - JavaScript objects are fast
  - Files are slower
  - Web pages are very slow
- Legacy and latency produced different APIs
- This has given rise to widely different programming models and tools
- That is... bad
