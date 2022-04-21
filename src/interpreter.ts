import { Environment } from "./environment";
import { Function } from "./function";
export class Interpreter {

    private globals: Environment

    constructor() {
        this.globals = new Environment(null, [], []) // the global environment doesn't have an enclosing environment, so its first parameter is null
        this.globals.define("equal?", (x: number, y: number) => x === y)
        this.globals.define("+", ((x: number, y: number) => x + y))
        this.globals.define("-", ((x: number, y: number) => x - y))
        this.globals.define("*", ((x: number, y: number) => x * y))
        this.globals.define("/", ((x: number, y: number) => x / y))
        this.globals.define("print", ((x: number) => console.log(x)))
        this.globals.define("pi", Math.PI)
    }
    evaluateProgram(program: (string | number | [] )[]) {
        for (let expression of program) {
            this.evaluate(expression)
        }
    }
    evaluate(expressions: (string | number | [])[] | string | number, environment: Environment=this.globals): number | Function {

        if (typeof (expressions) === "string")
            return environment.get(expressions) // this should always return a number or a function
        else if (typeof (expressions) === "number") // constant number
            return expressions
        else if (expressions[0] === "cond") { // returns a block of expressions. The block which is selected depends on which conditional returns true
            for (let conditional of expressions.slice(1)) {
                if (conditional[0] === "else")
                    return this.evaluate(conditional[1], environment)
                if (isTruthy(this.evaluate(conditional[0], environment)))
                    return this.evaluate(conditional[1], environment)
            }
        }
        else if (expressions[0] === "define") { // Define a variable or method
            if (typeof(expressions[1]) === "object") { // defines a function
                let params = expressions[1].slice(1) // slice(1) grabs the args while ignoring the name of the method
                let body = expressions[2]
                let method = new Function(params, body, environment)
                environment.define(expressions[1][0], method)
            }
            else{ // defines a variable
                environment.define(expressions[1], this.evaluate(expressions[2], environment))
            }
            
        }
        else {
            let procedure = this.evaluate(expressions[0], environment)
            let args = (string | number)[]
            for (let arg of expressions.slice(1)) {
                args.push(this.evaluate(arg, environment))
            }
            if (procedure instanceof Function)
                return procedure.call(this, args)
            else
                return procedure(...args)
        }
    }
}

const isTruthy = (value: number): number => {
    if (value === 0) return 0
    return 1
}