import { Environment } from "./environment";
import { Method } from "./method";
export class Interpreter {

    private globals: Environment

    constructor() {
        // let globals: any[][] = [
        //     ["cond", (...args: any[]) => { }],
        //     ["print", (...args: any[]) => {
        //         console.log(args.map(arg => this.evaluate(arg)).join(" "));
        //     }],
        //     ["define", (...args: any[]) => { }],
        //     ["+", ((x: any, y: any) => x + y)],
        //     ["-", ((x: any, y: any) => x - y)],
        //     ["*", ((x: any, y: any) => x * y)],
        //     ["/", ((x: any, y: any) => x / y)],
        //     ["pi", Math.PI]
        // ]

        this.globals = new Environment(null as any, [], [])
        this.globals.define("equal?", (x: number, y: number) => x === y)
        this.globals.define("+", ((x: number, y: number) => x + y))
        this.globals.define("-", ((x: number, y: number) => x - y))
        this.globals.define("*", ((x: number, y: number) => x * y))
        this.globals.define("/", ((x: number, y: number) => x / y))
        this.globals.define("print", ((x: number) => console.log(x)))
        this.globals.define("pi", Math.PI)
    }
    evaluateProgram(program: any[][]): any {
        // console.dir(program, { depth: null, maxArrayLength: null })
        for (let expression of program) {
            this.evaluate(expression)
        }
    }
    evaluate(expressions: any[] | string | number, environment: Environment=this.globals): any {
        // console.log("expressions")
        // console.log(expressions)
        // console.log("environment")
        // console.log(environment)
        // console.log("evaluate:")
        // console.log(expressions)
        if (typeof (expressions) === "string") {
            // console.log(this.environment.get(expressions))
            return environment.get(expressions) // this should always return a number or a function
        }
        else if (typeof (expressions) === "number") { // constant number
            return expressions
        }
        else if (expressions[0] === "cond") { // conditional
            for (let conditional of expressions.slice(1)) {
                if (conditional[0] === "else") {
                    return this.evaluate(conditional[1], environment)
                }
                if (isTruthy(this.evaluate(conditional[0], environment))) {
                    return this.evaluate(conditional[1], environment)
                }
            }
        }
        else if (expressions[0] === "define") { // Define a variable or method
            
            if (typeof(expressions[1]) === "object") { // method
                let params = expressions[1].slice(1) // slice(1) grabs the args while ignoring the name of the method
                let body = expressions[2]
                let method = new Method(params, body, environment)
                environment.define(expressions[1][0], method)
            }
            else{ // variable
                environment.define(expressions[1], this.evaluate(expressions[2], environment))
            }
            
        }
        else {
            let procedure = this.evaluate(expressions[0], environment)
            let args = []
            for (let arg of expressions.slice(1)) {
                args.push(this.evaluate(arg, environment))
            }
            if (procedure instanceof Method) {
                return procedure.call(this, args)
            }else {
                return procedure(...args)
            }
        }
    }
}

const isTruthy = (object: Object): boolean => {
    if (object == null) return false;
    if (typeof object == "boolean") return object as boolean;
    return true;
}

// const isEqual = (a: Object, b: Object): boolean => {
//     if (a == null && b == null) return true;
//     if (a == null) return false;

//     return a == b;
// }