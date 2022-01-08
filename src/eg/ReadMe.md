The eg grammar is as follows:

```
args: parentheticalArgs
      omittedParensArgs

assignment: ["…"]declaration = expression [extension]

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
            number
            reference

extension: .literal

functionCall: reference [args]

group: ( expression )

indirectCall: group args

key: assignment
     inheritableDeclaration
     declaration

list: expression , list
      expression

literal: everything but =(){}$&"'/`%, and whitespace

number: (valid JavaScript signed/unsigned integer or floating point number)

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

valueDeclaration: ["…"]declaration

variableDeclaration: {variableName}[extension]

variableName: for now, JavaScript identifiers with ASCII letters

variableReference: ${variableName}[extension]
```

The `eg` shell command parses an expression by starting with `expression`. The `Formula` class used by `ExplorableApp` parses a key which may be a formula by starting with `key`.
