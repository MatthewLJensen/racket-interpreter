import * as fs from 'fs';
import { Scanner } from './scanner';
import * as readline from 'readline';
import { Token } from './token';
import { Parser } from "./parser"
import { Interpreter } from "./interpreter"

const interpreter: Interpreter = new Interpreter()

const args = process.argv.slice(2)

if (args.length > 1) {
    console.log("Usage: tRack [script]")
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
            }
            prompt()
        })
    }
    prompt()
}

function run(source: string, fromRepl: boolean = false) {
    const scanner: Scanner = new Scanner(source)
    const tokens: string[] = scanner.tokenize()
    const parser: Parser = new Parser(tokens)
    const program: any = parser.parse()
    console.dir(program, { depth: null, maxArrayLength: null })
    
    const result = interpreter.evaluateProgram(program) // this prints the result by default
}



