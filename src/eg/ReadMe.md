The eg grammar is as follows:

```
statement: assignment
           expr

assignment: reference = expr [extension]

expr: doubleQuotedString
      singleQuotedString
      indirectCall
      group
      call

doubleQuotedString: "[text]"

singleQuotedString: '[text]'

indirectCall: group args

group: ( expr )

call: reference [args]

args: parentheticalArgs
      list

parentheticalArgs: ( [list] )

list: expr , list
      expr

reference: pattern
           identifier

pattern: [identifier]{identifier}[identifier]

extension: .identifier

identifier: everything but =(){}"', and whitespace
```
