# ExplorableGraph

A solid theoretical framework and practical API for modular web and software development

Somewhere on the continuum between build tools, file conversion utilities, static sites, and dynamic sites.

> Unifies JavaScript objects, file system, and web hierarchy

Synopsis: The browseable space is mapped to a physical filesystem folder structure. A route can be handled by a JavaScript module at that location in the physical filesystem.

# Design principles

Design principles from The 10,000 Year Clock

- Longevity
- Maintainability
- Transparency
- Evolvability
- Scalability

Some tried-and-true and brand new tech that may fit with these principles

- functions
- HTML pages
- JavaScript modules. Default export is a return value.
- Static and dynamic imports. Express a dependency graph.
- Server-side rendering
- HTML modules
- JSON modules

# Scenarios

- Static site that's beginning to need dynamic content
- Project that needs to generate some files in forms unique to the project
- Project with dynamic site that wants more inspectability of page results
- Dynamic site that wants the ability to go completely static at the end of its active lifetime
- Dynamic site written by people with Node.js experience but who don't have interest or experience writing a router
- Common file generation task reusable across multiple projects that each have additional needs

# Named files and named file maps

A named file is a JavaScript object that represents a physical or virtual file. The object itself (typically a string) represents the file's contents. The file also has associated metadata that includes the file's path.

A named file map maps a set of named files to a new set of named files.

A map has:

- source folder
- source pattern
- target folder
- target pattern
- transform function

Want to be able to ask an named file map:

- Generate the contents for file with path X. Used by the server to handle a route. This inverts the map.
- Generate the contents for a file with path X and save it to a target folder.
- Would you generate a file with path X? Used by clean to empty a target folder. This inverts the map.
- Generate the complete set of files. Used by build. This applies the map to a source folder, working forward to create the final target files.

# Arrow files

An arrow file is a file that represents a named file map.

Arrow files are identified with a `←` (left arrow character) somewhere in their name. An arrow file either creates a single file or an file map for the folder that contains the file.

The general form of an arrow file name is

    target←source(pattern)[.extension]

## Arrow file target

A single file arrow file is identified with a target that is a file name.

    index.html←source(pattern)

An file map arrow file is identified with a target that is a name pattern containing an asterisk:

    *.html←source(pattern)

## Arrow file source

The source in an arrow file name takes these forms:

Empty:

    target←

Empty in a JavaScript module:

    target←.js

Unnamed function:

    target←(pattern)

The file itself will be invoked as a shell command to process the file or file map.

Unnamed function in a JavaScript module:

    target←(pattern).js

The module's default export will be invoked to process the file or file map.

Named function. The function name must be either exported by arrow.config.js.

    target←Markdown(pattern)

Package name. The npm package must be installed, and its default module must have a default export.

    target←package(pattern)

For the named function and package name cases, only the file name is significant; the contents of the file are not used. The file itself can be empty, or you can use the file contents to document the effects of the arrow file.

## Map types

Both the target and source can include a pattern: the target can include a `*` placeholder or not, and the source can include a `*` wildcard or not. This gives rise to four possible file map types:

1. One file from one. Example: `foo.html←Copy(bar.html)`
2. One file from many. Example: `combined←Concat(*.txt)`
3. Many files from one. Example: `*.json←Split(..∕main.json)`
4. Many files from many. Example: `*.html←Markdown(*.md)`

Note that with type #3, the number of files is unknown ahead of time. This creates a challenge for cleaning up generated output. Since the map output can vary, running the map again might produce different results. Accordingly, with this type of many-from-one map, Allow will assume that any name matching the target pattern might potentially be produced by the map. When cleaning up the generated output of this map, it will presumptively remove any matching file it finds. In the example above, it will clean all .html files from the target folder.

## Source patterns

Inside the parenthesis, a source can specify a single file:

    (data.json)

This will generate a stream with the single indicated file.

You can supply a pattern inside the parenthesis used to match files in the current folder:

    (*.md)

The pattern can also specify relative or absolute file paths:

    (..∕sibling∕*)

NOTE: the above pattern uses the Unicode DIVISION SLASH (∕), not a regular slash (/). macOS does not allow the use of a slash in a file name.

If a pattern is local to the folder (doesn't look outside the folder), the source pattern cannot include the target pattern.

    *.html←Copy(*)   // Invalid

This is invalid because the \* source pattern includes files of the form `*.html`. Such a situation would create an infinite loop.

## Examples

- ←.json return an object that will be wrapped in ObjectGraph.
- \*←.js is a module that returns a virtual file map for a set of files of any potential type.
- data.json←().js is a module whose default export returns data that will be saved as a file called "data.json".
- \*.json←().js generates a stream of files with the .html extension.
- data.json←GetData() calls the GetData function and saves the results as data.json.
- index.html←().js is a JavaScript module whose default export returns HTML that will be used to create index.html.
- message.txt←() is a shell script whose output will be saved as the file message.txt.
- \*.html←(\*.md).js is a module that generates HTML for any markdown file in the folder.
- \*.html←(\*.md) is a shell script that generates HTML for any markdown file in the folder.
- \*.html←Blog(\*.md) indicates that the Blog function should be used to transform markdown files to html files.
- \*.html←Markdown(page1.md) will generate page1.html by applying the Markdown function to the contents of page1.md.
- \*.html←(\*.snippet).js is a JavaScript file that transforms .snippet files into HTML pages.
- \*←Copy(..∕sibling∕\*) copies all files in the ../sibling folder.
- \*.backup←Copy(..∕sibling∕\*) copies all files in the ../sibling folder, adding `.backup` to their name.

- getWeather|\*←.js provides a name. Can be used as a comment, sorting, avoiding duplicate names for files that handle the same patterns

> Would be nice to have some way of documenting what a module does:

- ←getWeatherFiles.js

## Helper functions

Arrow defines some standard helper functions:

- ←Copy() copies any file
- ←Concat(\*) takes all the matching files and concatenates them to create a new file.
- ←Array(\*) uses the matching file files to create an array file.

If your arrow.config.js defines functions with the same names, your functions will be used instead.

## Source folders

> Source folder serves as a skeleton for the target folder
> Target folder contents that were not generated from source are left untouched

A folder can include multiple arrow files, including multiple files that specify the same source or the same target.

    \*←Copy(..∕sibling∕a/*)
    \*←Copy(..∕sibling∕b/*)
    \*←Copy(..∕sibling∕c/*)

These patterns have the effect of copying all files from folders ../a, ../b, and ../c to the target folder.

## API

- arrow.readFile: like fs.readFile, but also handles virtual files and transformations
- arrow.readDir: like fs.readDir, but also returns virtual files

## Folder types

- Folder with fixed set of modules for the routes it handles
- Folder with a fixed set of virtual pages.
- Folder that maps physical files of one type (e.g., markdown files) to a fixed set of virtual pages. A special case of the above.
- Folder that handles a parameterized route. These cannot be rendered to static form.

Can also mix all of the above.

## Virtual filesystems

- readFile(path)
- readdir([path])

or

- virtualFile(name)
- virtualFileNames()

or

- readFile(name)
- fileNames(name)

You can define these in a ←.js module:

```js
const tinyFileSystem = {
  file1: "This is the first file",
  file2: "This is the second file",
};

export default {
  virtualFile(name) {
    return tinyFileSystem[name];
  }

  virtualFileNames() {
    return Object.keys(tinyFileSystem);
  }
};
```

## Chaining

### Blog

Source

    /blog
      index.html←(json.temp∕*.json).js
      /markdown
        post1.md
      /json.temp
        *.json←(..∕markdown∕*.md).js
      /posts
        *.html←(..∕json.temp∕*.json).js

Using named functions:

    /blog
      index.html←HomePage(json.temp∕*.json)
      /markdown
        post1.md
      /json.temp
        *.json←Markdown(..∕markdown∕*.md)
      /posts
        *.html←BlogPage(..∕json.temp∕*.json)

Target (dev build includes temp folders)

    /blog
      index.html
      /json.temp
        post1.json
      /posts
        post1.html

Target (production build does not generate temp folders)

    /blog
      index.html
      /posts
        post1.html

Server (all files kept virtual)

Could skip separate temp folder:

    /blog
      index.html←HomePage(json.temp∕*.json)
      /markdown
        *.json←Markdown(..∕markdown∕*.md)
        post1.md
      /posts
        *.html←BlogPage(..∕json.temp∕*.json)

This would generate:

    /blog
      index.html
      /markdown.temp
        post1.json
      /posts
        post1.html

### Hacker News

    /news
      index.html←HomePage(.temp∕*.json)
      /.temp
        articles.rss←Rss()
        *.json←RssToJson(articles.rss)
      /articles
        *.html←ArticlePage(..∕rss.temp∕*.json)

### Component Kitchen

    /
      /jsdoc
        *.json ← JsDoc(..∕node_modules∕elix∕src∕base∕*.js)
        *.json ← JsDoc(..∕node_modules∕elix∕src∕core∕*.js)
        *.json ← JsDoc(..∕node_modules∕elix∕src∕plain∕*.js)
      /augmented
        *.json ← Augment(..∕jsdoc∕*.json)
      /markdown
        ReactiveElement.md
      /html
        *.html ← DocPage(..∕augmented∕*.json)
        index.json ← Array(..∕augmented/*.json)
      /documentation
        index.html ← ElixHome(..∕html∕index.json)
        * ← Copy(..∕html∕*.html)

# Usage

## In JavaScript

```js
import { buildDirectory, FileMap } from "arrow";

const htmlFromTxt = new FileMap({
  source: "./source/*.txt",
  target: "./target/*.html",
  transform: (txt) => `<html><body>${txt}</body></html>`,
});
buildDirectory({
  target: ".",
  maps: [htmlFromTxt],
});
```

## Arrow command line tool

- arrow ls
- arrow cat post1.html
- arrow make \*←MappedSite(//component.kitchen/elix/\*) . Copy a portion of a site
- arrow make - . | arrow copy backup - Creates JSON representation of current folder, pipes, recreates it in backup
- arrow clean
- arrow tree

## Server middleware

> Middleware uses arrow.readFile: returns a physical file if it exists, or a virtual file if one can be generated.

- types
  - one-from-one: transform
  - many-from-many: AsyncGraphTransformer
  - one-from-many: AsyncGraphReducer
  - many-from-one: AsyncGraphExpander

JSON for blog:

```json
{
  "blog": [
    "index.html←(json.temp∕*.json).js",
    "markdown": [
      "post1.md": "# This is the first post"
    ],
    "json.temp": [
      "*.json←(..∕markdown∕*.md).js": ""
    ],
    "posts": [
       "*.html←(..∕json.temp∕*.json).js": ""
    ]
  ]
}
```

Or JavaScript:

```js
app.use(graphRouter(new VirtualObject({
  "blog": [
    "index.html←(json.temp∕*.json).js",
    "markdown": [
      "post1.md": new FileGraph(postsDirectory)
    ],
    "json.temp": [
      "*.json←(..∕markdown∕*.md).js": ""
    ],
    "posts": [
       "*.html←(..∕json.temp∕*.json).js": ""
    ]
  ]
})));
```
