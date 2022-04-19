//Parser is somewhat translated from http://norvig.com/lispy.html
export class Environment {
    private values: Map<string, Object> = new Map<string, Object>()

    constructor() {
        this.values.set("cond", (...args: any[]) => {})
        this.values.set("define", (...args: any[]) => {})
        this.values.set("+", ((x: any, y: any) => x + y))
        this.values.set("-", ((x: any, y: any) => x - y))
        this.values.set("*", ((x: any, y: any) => x * y))
        this.values.set("/", ((x: any, y: any) => x / y))
        this.values.set("print", ((x: any) => console.log(x)))
        this.values.set("pi", Math.PI)
    }
                                                                                                                                                                                                                         
    get(name: string): Object {
        if (this.values.has(name)) {
            return this.values.get(name) as any
        }
        console.log("Undefined variable: " + name)
        return null as any
    }
    define(name: string, value: Object) {
        this.values.set(name, value);
    }
}

