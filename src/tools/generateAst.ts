import { argv } from 'process'
import { writeFileSync } from 'fs'

const dependencies = [
    'import { Token } from "./token"'
]

const expressions = [
    "Assign   : Token name, Expr value",
    "Binary   : Expr left, Token operator, Expr right",
    "Ternary  : Expr expression, Expr left, Expr right",
    "Call     : Expr callee, Token paren, Expr[] args",
    "Get      : Expr object, Token name",
    "Grouping : Expr expression",
    "Literal  : Object value",
    "Logical  : Expr left, Token operator, Expr right",
    "Set      : Expr object, Token name, Expr value",
    "Super    : Token keyword, Token method",
    "This     : Token keyword",
    "Unary    : Token operator, Expr right",
    "Variable : Token name"
]

// this was using Java namespaces. I decided to import the Expr module as Expr, so everything is referenced as Expr., including the abstract Expr, Which looks like Expr.Expr
const statements = [
    "Block      : Stmt[] statements",
    "Class      : Token name, Expr.Variable superclass, Func[] methods",
    "Expression : Expr.Expr expression",
    "Func       : Token name, Token[] params, Stmt[] body",
    "If         : Expr.Expr condition, Stmt thenBranch, Stmt elseBranch",
    "Print      : Expr.Expr expression",
    "Return     : Token keyword, Expr.Expr value",
    "Var        : Token name, Expr.Expr initializer",
    "While      : Expr.Expr condition, Stmt body",
    
    // Custom Extensions
    "For        : Expr.Expr condition, Stmt body, Stmt increment, Stmt initializer",
    "Break      : ",
    "Continue   : ",
    "Exit       : ",
    "Switch     : Expr.Expr expression, Array<(Stmt|Expr.Expr)>[] cases, Stmt defaultCase",

]

function defineAST(outputDir: string, baseName: string, types: string[]) {
    let output = ""

    output += dependencies.join('\n')

    if (baseName == "Stmt") {
        output += '\nimport * as Expr from "./expr"'
    }

    //Generate the visitor interfaces
    output += `\n\n ${defineVisitor(baseName, types)}`

    output += `\nexport abstract class ${baseName} {\n    abstract accept<R>(visitor: Visitor<R>): R\n}\n\n`

    for (const type of types) {
        const className = type.split(':')[0].trim()
        const fields = type.split(":")[1].trim()
        output += defineType(baseName, className, fields)
    }

    const path = `${baseName}.ts`
    // we don't need to use outputdir since we are going to store them all together.
    writeFileSync(path, output.trim(), { flag: 'w' })


}

function defineVisitor(baseName: string, types: string[]) {
    let output: string = `\nexport interface Visitor<R> {\n`

    for (const type of types) {
        const typeName = type.split(":")[0].trim()
        output += `    visit${typeName + baseName}(${baseName.toLowerCase()}: ${typeName}): R\n`
    }
    output += "}\n"

    return output
}

function defineType(baseName: string, className: string, fieldList: string) {
    let output = ""

    output += `export class ${className} extends ${baseName} {\n`

    // for break statement
    if (fieldList.trim() != "") {


        // class members
        for (const field of fieldList.split(",")) {
            const name = field.trim().split(" ")[1]
            const type = field.trim().split(" ")[0]
            output += `    public ${name.trim()}: ${type}\n`
        }

    }

    // constructor
    output += `\n    constructor(`

    // for break statement
    if (fieldList.trim() != "") {
        // constructor parameters
        for (const field of fieldList.split(",")) {
            const name = field.trim().split(" ")[1]
            const type = field.trim().split(" ")[0]
            output += `${name.trim()}: ${type}, `
        }
        // trim off last ", " 
        output = output.substring(0, output.length - 2)
    }


    output += `) {\n        super()\n`

    // for break statement
    if (fieldList.trim() != "") {
        // assignments
        for (const field of fieldList.split(",")) {
            const name = field.trim().split(" ")[1]
            output += `        this.${name} = ${name}\n`
        }
    }

    output += '    }\n\n'

    output += `    accept = <R>(visitor: Visitor<R>): R => {
            return visitor.visit${className + baseName}(this)
        }`

    output += '\n}\n\n'

    return output

}

const main = (): void => {
    const args = argv.slice(2)

    if (args.length !== 0) {
        console.log("Not specifying correct number of arguments. Usage: generateAST")
    } else {
        defineAST(args[0], 'Expr', expressions)
        defineAST(args[0], 'Stmt', statements)
    }

}

main()


