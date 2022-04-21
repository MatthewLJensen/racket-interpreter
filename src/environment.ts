//Parser is somewhat translated from http://norvig.com/lispy.html
import { Function } from "./function"
export class Environment {
    values: Map<string, Object> = new Map<string, Object>()
    private enclosing: Environment | null

    constructor(enclosing: Environment | null, params: any[] = [], args: any[] = []) {
        this.enclosing = enclosing
        let paramsAndArgs = this.zip(params, args)
        for (let i of paramsAndArgs) {
            this.define(i[0], i[1])
        }
    }
    private zip = (a: any, b: any) => a.map((k: any, i: any) => [k, b[i]]);

    get(name: string): number | Function {
        if (this.values.has(name)) {
            return this.values.get(name) as any
        }

        if (this.enclosing != null) return this.enclosing.get(name)

        console.log("Undefined variable: " + name)
        return null as any
    }
    define(name: string, value: Object) {
        this.values.set(name, value);
    }
}

