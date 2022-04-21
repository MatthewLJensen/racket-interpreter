# tRack - A simplified interpreter for the Rackert programming language, built in Typescript.

tRack is a monotype language, dealing only with values as numbers.
## Grammar

```
Grammar	    ::= def-expr*

def-expr 	::= def | expr

def         ::= "(" "define" "("variable variable*")" expr")"
            |	"(" "define" variable expr")"


expr        ::=	variable
            |	value
 	      	|	"("variable expr*")"
 	      	|	"(" "cond" ("["expr expr"]")+ ("[" "else" expr "]")? ")"


variable    ::= [^'"()\n ]+

value       ::= [0-9]+('.'[0-9]+)?
```

## Built-in Functions/Values
### Functions
| Variable    | Description | Example     | Result |
| ----------- | ----------- | ----------- | -------- |
| +           | Binary operator. Adds two numbers. | (+  3.5  7)  | 10.5 |
| -           | Binary operator. Subtracts two numbers. | (-  3.5  7)  | -4.5 |
| *           | Binary operator. Multiplies two numbers. | (*  3.5  7)  | 24.5 |
| /           | Binary operator. Divides two numbers. | (/  3.5  .5)  | 7.0 |
| equal?      | Binary operator. Returns 1 if two values are equal, 0 if not. | (equal?  3.5  3.5)  | 1 |
| print       | Prints a value to the console. | (print (- 10 3))  |  7 |

### Values
| Variable    | Description | Equivalent value     | 
| ----------- | ----------- | ----------- | 
| pi          | Equal to the value π | TypeScript's Math.PI  | 



## Testing

Ran the following test:
```
TODO
```

## Sample Scripts

### Factorial of 100
```
(define (factorial base)
    (cond ((equal? base 1) 1)
          (else (* base (factorial (- base 1))))))
(print (factorial 100))
```
Returns:
```9.33262154439441e+157```