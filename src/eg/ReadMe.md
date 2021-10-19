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
            protocolIndirectCall
            slashCall
            functionCall
            getCall

extension: .literal

functionCall: getCall [args]

getCall: reference

group: ( expression )

key: assignment
     declaration

indirectCall: group args

list: expression , list
      expression

literal: everything but =(){}$&"'/, and whitespace

omittedParensArgs: whitespace list

parentheticalArgs: ( [list] )

pathKey: group
         reference

reference: variableReference
           literal

singleQuoteString: '[text]'

protocolIndirectCall: getCall ":"|"://" slashPath

slashCall: getCall "/" [slashPath]

slashPath: pathKey / slashPath
           pathKey

spaceUrl: spaceUrlProtocol whitespace spaceUrlPath

spaceUrlProtocol: https
                  http

spaceUrlPath: pathKey whitespace spaceUrlPath
              pathKey

variableDeclaration: {variableName}[extension]

variableName: for now, JavaScript identifiers with ASCII letters

variableReference: ${variableName}[extension]
```

The `eg` shell command parses an expression by starting with `expression`. The `Formula` class used by `ExplorableApp` parses a key which may be a formula by starting with `key`.
