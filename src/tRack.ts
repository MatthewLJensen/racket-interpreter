import * as fs from 'fs';
import { Scanner } from './scanner';
import * as readline from 'readline';
import { Token } from './token';
import { Parser } from "./parser"
import { Interpreter } from "./interpreter"
import { hadRuntimeError, setHadError, getHadError } from './errorHandling';

const interpreter: Interpreter = new Interpreter()

const args = process.argv.slice(2)
let rpn = false
let ast = false

// check for --rpn flag. if it is present, print the RPN version of the expression.
if (args.length > 0 && args[0] === '--rpn') {
    rpn = true
    args.splice(0, 1)
}

if (args.length > 1) {
    console.log("Usage: tlox [script]")
    process.exit(64)
} else if (args.length == 1) {
    runFile(args[0])

} else {
    runPrompt()
}


function runFile(path: string) {
    const buffer = fs.readFileSync(path).toString('utf-8')

    run(buffer, false)
    // if (getHadError()) process.exit(65);
    // if (hadRuntimeError) process.exit(70);
    process.exit()
}

function runPrompt() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false // prevents printing of first user input line within REPL
    })
    


    const prompt = () => {
        process.stderr.write("> ")
        rl.question('', line => {
            switch (line) {
                case null:
                    break
                default:
                    run(line, true)
                    setHadError(false)
            }
            prompt()
        })
    }
    prompt()
}

function run(source: string, fromRepl: boolean = false) {
    const scanner: Scanner = new Scanner(source)
    const tokens: Token[] = scanner.scanTokens()
    const parser: Parser = new Parser(tokens)
    const syntax: Object = fromRepl ? parser.parseRepl() : parser.parse()



    if (syntax instanceof Array) {
        
        resolver.resolveArray(syntax);
        if (getHadError()) return
        interpreter.interpret(syntax);
    } else if (syntax instanceof Expr) {
        if (rpn) {
            
            console.log(new RpnPrinter().rpnPrintExpr(syntax))
        } else if (ast) {
            console.log(new AstPrinter().printExpr(syntax))
        } else {
            resolver.resolveExpr(syntax);
            if (getHadError()) return
            interpreter.interpretExpression(syntax)
        }
    }
}



