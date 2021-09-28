The eg grammar is as follows:

```
key: assignment [extension]
     reference

assignment: reference = expression

expression: doubleQuotedString
            singleQuotedString
            indirectCall
            group
            call

doubleQuotedString: "[text]"

singleQuotedString: '[text]'

indirectCall: group args

group: ( expression )

call: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expression , list
      expression

reference: pattern
           identifier

pattern: {identifier}[identifier]

extension: .identifier

identifier: everything but =(){}"', and whitespace
```
