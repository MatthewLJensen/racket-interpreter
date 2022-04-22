import { Environment } from "./environment";
import { Interpreter } from "./interpreter";

export class Function{
    private params: any
    private body: any
    private environment: Environment

    constructor(params: any[], body: any, environment: Environment) {
        this.params = params
        this.body = body
        this.environment = environment
    }
    public call(interpreter: Interpreter, args: (string | number | Function | (() => number))[]): number {
        let environment = new Environment(this.environment, this.params, args)

        return interpreter.evaluate(this.body, environment) as number
    }
}