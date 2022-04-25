import { Environment } from "./environment";
import { RuntimeError } from "./errors";
import { Function } from "./function";
export class Interpreter {
    private variableNameRegExp = /['"()\n ]/
    private globals: Environment

    constructor() {
        this.globals = new Environment(null, [], []) // the global environment doesn't have an enclosing environment, so its first parameter is null
        this.globals.define("equal?", (x: number, y: number) => isTruthy(x === y))
        this.globals.define("+", ((x: number, y: number) => x + y))
        this.globals.define("-", ((x: number, y: number) => x - y))
        this.globals.define("*", ((x: number, y: number) => x * y))
        this.globals.define("/", ((x: number, y: number) => x / y))
        this.globals.define("print", ((x: number) => console.log(x)))
        this.globals.define("pi", Math.PI)
    }
    evaluateProgram(program: (string | number | [])[]) {
        for (let expression of program) {
            this.evaluate(expression)
        }
    }
    evaluate(expressions: (string | number | (string | number)[])[] | string | number, environment: Environment = this.globals): number | Function | (() => number) {
        try {
            if (typeof (expressions) === "string")
                return environment.get(expressions) // this should always return a number or a function
            else if (typeof (expressions) === "number") // constant number
                return expressions
            else if (expressions[0] === "cond") { // returns a block of expressions. The block which is selected depends on which conditional returns true

                for (let conditional of expressions.slice(1)) {
                    if (typeof (conditional) === "object") {
                        if (conditional[0] === "else") // if an else block is found, evaluate it and return the result
                            return this.evaluate(conditional[1], environment)
                        if (conditional.length === 2) {
                            if (isTruthy(this.evaluate(conditional[0], environment) as number)) // otherwise check syntax of conditional, evaluate the conditional and return the result if the conditional is true
                                return this.evaluate(conditional[1], environment)
                        }
                        else {
                            throw new RuntimeError("Error: Invalid conditional expression. Conditionals must have exactly two elements.")
                        }
                    } else {
                        throw new RuntimeError("Error: Conditional expression be a list")
                    }

                }
                throw new RuntimeError("Error: No conditional matched")

            }
            else if (expressions[0] === "define") { // Define a variable or method
                if (typeof (expressions[1]) === "object") { // defines a function
                    let params = expressions[1].slice(1) // slice(1) grabs the args while ignoring the name of the method
                    let body = expressions[2]
                    let method = new Function(params, body, environment)
                    if (typeof (expressions[1][0]) === "string" && !this.variableNameRegExp.test(expressions[1][0]))
                        environment.define(expressions[1][0], method)
                    else
                        throw new RuntimeError("Error: Function name must be a string")
                    return 1
                }
                else { // defines a variable
                    if (typeof (expressions[1]) === "string" && !this.variableNameRegExp.test(expressions[1]))
                        environment.define(expressions[1], this.evaluate(expressions[2], environment))
                    else
                        throw new RuntimeError("Error: Variable name must be a string")
                    return 1
                }

            }
            else {
                let procedure = this.evaluate(expressions[0], environment)
                let args: (string | number | Function | (() => number))[] = []
                for (let arg of expressions.slice(1)) {
                    args.push(this.evaluate(arg, environment))
                }
                if (procedure instanceof Function)
                    return procedure.call(this, args)
                else {

                    return (procedure as any)(...args)
                    // console.log("test2")
                }

            }
        } catch (error) {
            console.log((error as RuntimeError).message)
            process.exit(1)
        }
    }
}

const isTruthy = (value: number | boolean): number => {
    if (value === 0 || value === false) {
        return 0
    }
    return 1
}




