export class Interpreter{
    constructor() {
        
    }


    interpret(expressions: any) {
        try {
            for (let expr of expressions) {
                this.evaluate(expr);
            }
        } catch (error) {
            console.log(error)
        }
    }


    evaluate(expr: any): Object {
        return expr.accept(this);
    }

}

const isTruthy = (object: Object): boolean => {
    if (object == null) return false;
    if (typeof object == "boolean") return object as boolean;
    return true;
}

const isEqual = (a: Object, b: Object): boolean => {
    if (a == null && b == null) return true;
    if (a == null) return false;

    return a == b;
}