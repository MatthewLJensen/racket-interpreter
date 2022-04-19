import { Environment } from "./environment";
export class Interpreter {

    private environment: Environment = new Environment();

    constructor() {
    }
    evaluateProgram(program: any[][]): any {
        // console.log("evaluateProgram:")
        // console.log(program)
        for (let expression of program) {
            this.evaluate(expression)
            //let result = this.evaluate(expression)
            // if (result) {
            //     console.log(result)
            // }
        }
    }
    evaluate(expressions: any[] | string | number): any {
        // console.log("evaluate:")
        // console.log(expressions)
        if (typeof (expressions) === "string") {
            // console.log(this.environment.get(expressions))
            return this.environment.get(expressions) // this should always return a number or a function
        }
        else if (typeof (expressions) === "number") { // constant number
            return expressions
        }
        else if (expressions[0] === "cond") { // conditional
            console.log("not implemented")
        }
        else if (expressions[0] === "define") { // Define a variable or method
            this.environment.define(expressions[1], this.evaluate(expressions[2]))
        }
        else {
            let procedure = this.evaluate(expressions[0])
            let args = []
            for (let arg of expressions.slice(1)) {
                args.push(this.evaluate(arg))
            }
            // console.log("procedure:")
            // console.log(procedure)
            // console.log("args: " + args)
            // console.log("result: ")
            // console.log(procedure(...args))
            return procedure(...args)
        }

    }
}

// const isTruthy = (object: Object): boolean => {
//     if (object == null) return false;
//     if (typeof object == "boolean") return object as boolean;
//     return true;
// }

// const isEqual = (a: Object, b: Object): boolean => {
//     if (a == null && b == null) return true;
//     if (a == null) return false;

//     return a == b;
// }