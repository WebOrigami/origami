The eg grammar is as follows:

```
args: parentheticalArgs
      omittedParensArgs

assignment: declaration = expression [extension]

backtickContents: backtickText variableReference backtickContents
                  backtickText

backtickQuoteString: `backtickContents`

backtickText: everything but ` and $

declaration: variableDeclaration
             literal

expression: singleQuoteString
            backtickQuoteString
            indirectCall
            group
            spaceUrl
            spacePathCall
            protocolCall
            slashCall
            percentCall
            functionCall
            reference

extension: .literal

functionCall: reference [args]

group: ( expression )

key: assignment
     declaration

indirectCall: group args

list: expression , list
      expression

literal: everything but =(){}$&"'/`%, and whitespace

omittedParensArgs: whitespace list

parentheticalArgs: ( [list] )

pathHead: indirectCall
          group
          functionCall
          getReference

pathKey: group
         reference

reference: thisReference
           variableReference
           literal

singleQuoteString: '[text]'

percentCall: pathHead "/" [percentPath]

percentPath: pathKey / percentPath
           pathKey

protocolCall: pathHead ":"|"://" slashPath
              pathHead ":"|"://" protocolCall

slashCall: ["//"] pathHead "/" [slashPath]

slashPath: pathKey / slashPath
           pathKey

spaceUrl: spaceUrlProtocol whitespace spaceUrlPath

spaceUrlProtocol: https
                  http

spaceUrlPath: pathKey whitespace spaceUrlPath
              pathKey

spacePathCall: "."|".." [spaceUrlPath]

thisReference: "this"

variableDeclaration: {variableName}[extension]

variableName: for now, JavaScript identifiers with ASCII letters

variableReference: ${variableName}[extension]
```

The `eg` shell command parses an expression by starting with `expression`. The `Formula` class used by `ExplorableApp` parses a key which may be a formula by starting with `key`.
