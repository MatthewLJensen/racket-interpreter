# tRack - A simplified interpreter for the Rackert programming language, built in Typescript.

tRack is a monotype language, dealing only with values as numbers.
## Grammar

```
Grammar	::=         def-expr*

def-expr 	::=         define | expr

define      ::=         "(" "define" "("variable variable*")" expr")"
            |           "(" "define" variable expr")"


expr        ::=	variable
            |	value
 	|	"("variable expr*")"
 	|	"(" "cond" ("("expr expr")")+ ("(" "else" expr ")")? ")"


variable    ::=         [^'"()\n ]+

value       ::=         [0-9]+('.'[0-9]+)?
```

## Built-in Functions/Values
### Functions
| Variable    | Description | Example     | Result |
| ----------- | ----------- | ----------- | -------- |
| +           | Binary operator. Adds two numbers. | (+  3.5  7)  | 10.5 |
| -           | Binary operator. Subtracts two numbers. | (-  3.5  7)  | -4.5 |
| *           | Binary operator. Multiplies two numbers. | (*  3.5  7)  | 24.5 |
| /           | Binary operator. Divides two numbers. | (/  3.5  .5)  | 7.0 |
| %           | Binary operator. Divides two numbers and returns the remainder. | (%  3  2)  | 1 |
| expt        | Binary operator. Raises the first number to the power of the second. | (expt  3  2)  | 9 |    
| equal?      | Binary operator. Returns 1 if two values are equal, 0 if not. | (equal?  3.5  3.5)  | 1 |
| print       | Prints a value to the console. | (print (- 10 3))  |  7 |


### Values
| Variable    | Description | Equivalent value     | 
| ----------- | ----------- | ----------- | 
| pi          | Equal to the value π | TypeScript's Math.PI  | 


## Truthiness
How does one implement conditions without bool types? Anything that is not 0 is truthy, 0 is the only falsy value.

## Functions
Functions can either have one expression or multiple expressions. If they have multiple expressions, they will return 1. If they have one expression, they will return the value of that expression. Is this the way it should be? Well, it is the way it is.

## Testing
100% test coverage achieved? You betcha!
To run test suite, navigate to _src/test and run:
```
node test_tRack.mjs
```


### Grammar
1\. Define


In order to test that we can define variables, we implemented a test that defines a variable "r" and then uses it to compute the area of a circle. This test also tests that the value of pi is correct.

_circleArea.track_

```
(define r 10)
(print (* pi (* r r)))
```
Expected output (_expected/circleArea_):
```
314.1592653589793
```
In order to test the the ability to define a function, we extended the above program to define a function "multiply" that takes a two arguments argument and returns the square of that argument. this tests that a function can have multiple arguments. Also, we added a function to compute the area of a circle that utilizes the multiply function. We then test the circleArea function by calling it with a radius of 10.

_circleAreaFunction.track_

```
(define radius 10)
(define (multiply x y) (* x y))
(define (circleArea r) (* pi (multiply r r)))
(print (circleArea radius))
```

Expected Output (_expected/circleAreaFunction_):
```
314.1592653589793
```

2\. Expr

The above tests also test most of the expression tree. The creation of a variable (which is made up of a string that does not include quotes, newlines, parentheses, or spaces), the creation of a value (which is made up of a number either whole or decimal), and the use of a function call (which is made up of a function name and a list of arguments). The last piece to test in the expressions leaf is the use of conditional expressions.

To this end, a recursive factorial function was created that tests for the base case by utilizing a conditional.

_fact100.track_
```
(define (factorial base)
    (cond ((equal? base 1) 1)
          (else (* base (factorial (- base 1))))))
(print (factorial 100))
```

Expected Output (_expected/fact100_):
```
9.33262154439441e+157
```

In order to test the ability to have multiple conditionals prior to the else, we created a simple test that should return 5, and not run the else. Then, in order to test else, we then duplicated this and changed the conditionals such that the else should run.

_conditionals.track_

```
(define base 3)
(cond 
    ((equal? base 4) (print 1))
    ((equal? 3 base) (print 5))
    (else (print 3))
)
(cond 
    ((equal? base 4) (print 1))
    ((equal? 5 base) (print 5))
    (else (print 3))
)
```

Expected Output (_expected/conditionals_):
```
5
3
```

### Built-in Functions
All of the built in functions are tested in the below test

_built_in_functions.track_
```
(define w 2)
(define x 5)
(define y 10)
(define z x)
(define a (+ x y))
(define b (- a y))
(define c (/ x b))
(define d (/ x w))
(define e (* c z))
(define f (equal? e y))
(define g (equal? z x))
(print a)
(print b)
(print c)
(print d)
(print e)
(print f)
(print g)
```
Expected output:  
_expected/built_in_functions_
```
15
5
1
2.5
5
0
1
```

### Built-in Values
There is currently only 1 built in value, pi. It is tested within both the _circleAreaFunction.track_ and _circleArea.track_ tests.

### Environments
tRack utilizes environments to store variables/functions and their values as opposed to implementing substitution. The environment is a list of pairs, where each pair is a variable and its value/function.

Testing that environments are implemented correctly is done in the _environment.track_ test.

_environment.track_

```
(define test 15)
(define test2 25)
(define (env1) 
    (
        (print test)
        (define test 2)
        (print test)
        (define (env2) 
            (
                (print test)
                (define test 3)
                (print test)
            )
        )
        (env2)
        (print test2)
        (print test)
    )
)

(env1)

```
Expected output (_expected/environment_):
```
15
2
2
3
25
2
```

### Error Handling
1\. Parse Errors
* Unexpected end of input  
If the program reaches the end while still expecting more content, it is a parse error.

    _unexpected_end_of_input.track_

    ```
    (define test 4)
    (print test
    ```
    Expected output (_expected/unexpected_end_of_input_):

    ```
    Error: Unexpected end of input
    ```

* Unexpected ")"   
If there are too many closing parentheses, the parser will throw an error. This script tests this functionality.

    _unexpected_closing_paren.track_

    ```
    (define test 4))
    (print test)
    ```

    Expected output (_expected/unexpected_closing_paren_):
    ```
    Error: unexpected ')'
    ```


2\. Runtime Errors

The following are runtime errors:

1. Invalid conditional expression
    
    This error is thrown when a conditional expression is not an array. This is likely because the programmer did not use the correct syntax. This should probably be a parse error, but it isn't.

    _conditional_not_formatted_correctly.track_

    ```
    (define test 15)
    (define test2 14)
    (cond 
        (equal? 15 test2)
        ((equal? 16 test) (print test2))
    )
    ```
    Expected output (_expected/conditional_not_formatted_correctly_):
    ```
    Error: Invalid conditional expression. Conditionals must have exactly two elements.
    ```

2. No conditional matched  
    Every expression must evaluate to a value. If a conditional has no match, and no else, then it is a runtime error.
    
    _no_conditional_matched.track_
    
    ```
    (define test 15)
    (define test2 14)
    (cond 
        ((equal? 15 test2) (print 15))
        ((equal? 16 test) (print test2))
    )
    ```
    Expected output (_expected/no_conditional_matched_):
    ```
    Error: No conditional matched
    ```

3. Function name must be a string  
    This error is thrown when a function name is not a string.
    _function_must_be_string.track_
    
    ```
    (define (test" r)(* r r))
    (print (test" 14))
    ```
    Expected output (_expected/function_must_be_string_):
    ```
    Error: Function name must be a string
    ```
    
4. Variable name must be a string  
    Variable names must be strings that do not include parentheses, quotes, or newlines.
    
    _variable_must_be_string.track_
    
    ```
    (define test' 5)
    (print test')
    ```
    Expected output (_expected/variable_must_be_string_):
    ```
    Error: Variable name must be a string
    ```

5. Conditionals must have exactly two elements.
    Each conditional must have a condition and an expression to be evaluated if the condition evaluates to true.

    _runtime_error_conditional_2_elements.track_
    
    ```
    (define test 15)
    (define test2 14)
    (cond 
        ((equal? 15 test2))
    )
    ```
    Expected output (_expected/runtime_error_conditional_2_elements_):
    ```
    Error: Invalid conditional expression. Conditionals must have exactly two elements.
    ```

6. Conditional expression must be a list.
    Each conditional expression must have been parsed into a list. This basically means that the expression must be wrapped in parentheses.

    _runtime_error_conditional_must_be_list.track_
    
    ```
    (cond 5 (print test))
    ```
    Expected output (_expected/runtime_error_conditional_must_be_list_):
    ```
    Error: Conditional expression must be a list. Is your conditional expression surrounded by parentheses?
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

### Estimate Pi
```
(define (calc_pi n)
    (cond 
        ((equal? n 1) 4)
        (else (+ (* (* 4 (expt (- 0 1) (+ n 1))) (/ 1 (- (* 2 n) 1))) (calc_pi (- n 1))))
    )
)
(print (calc_pi 400))
```
Returns:
```3.1390926574960143```
