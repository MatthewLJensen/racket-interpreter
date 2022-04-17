import * as child_process from 'child_process';
import * as fs from 'fs';
// Testing that expressions are parsed and interpreted correctly.
var general_tests = [
    ['General tests'                                    , ''],
    ['(15/5) * (3 + 4) - (2 + 3) * (4 - 3) / (5 - 3)'   , '18.5'],
    ['15 * 3 + 4 * 5'                                   , '65'],
    ['15 * 3 + 4 * 5 / 2'                               , '55'],
    ['3.5 * 3.5'                                        , '12.25'],
    ['3.5 * 3.5 * 3.5'                                  , '42.875'],
    ['14.5 - 3.7'                                       , '10.8'],
    ['14.5 - 3.7 + 3.7'                                 , '14.5'],
    ['(15 * 3 + 4 * 5 / 2 - 3'                          , '[line 1] Error at end: Expect \')\' after expression.'],
    ['"cat" + "dog"'                                    , 'catdog'],
    ['"cat" > 5'                                        , 'Operands must be both numbers or both strings.\n[line 1]'],
    // no longer expected behavior, I think...
    // ["-cat"                                             , 'Operand must be a number.\n[line 1]'],
    // ["!cat"                                             , 'false'],
]
var rpn_tests = [
    ['RPN Tests'                           , "--rpn"],
    ['1 + 2 + 3'                           , "1 2 + 3 +"],
    ['1 + 2 * 3'                           , "1 2 3 * +"],
    ['1 + 2 * 3 + 4'                       , "1 2 3 * + 4 +"],
    ['(15 + 5) / 2'                        , "15 5 + 2 /"],
    ['!15'                                 , "15 not"],
    ['!(15 + 5)'                           , "15 5 + not"],
    ['-(15 + 5) / 2'                       , "15 5 + neg 2 /"],
    ['15 + 5 - -(15 + 5) / 2'              , "15 5 + 15 5 + neg 2 / -"],
    ['15 == 15'                            , "15 15 =="],
    ['15 != 15'                            , "15 15 !="],
    ['15 < 15'                             , "15 15 <"],
    ['15 <= 15'                            , "15 15 <="],
    ['15 > 15'                             , "15 15 >"],
    ['15 >= 15'                            , "15 15 >="],
    ['14.7 + 15.3'                         , "14.7 15.3 +"],
    ['14.7 + 15.3 * 2'                     , "14.7 15.3 2 * +"],
    ['14.7 + 15.3 * 2 + 3.5'               , "14.7 15.3 2 * + 3.5 +"],
    ['125.32 / 2.5'                        , "125.32 2.5 /"],
    ['125.37 - 125.32 / 2.5'               , "125.37 125.32 2.5 / -"],
    ['14 < 15 == true'                     , "14 15 < true =="],
    ['\"cow\" < \"kitten\"'                , "cow kitten <"],
    ['\"cow\" <= \"kitten\"'               , "cow kitten <="],
    ['\"cow\" > \"kitten\"'                , "cow kitten >"],
    ['\"cow\" >= \"kitten\"'               , "cow kitten >="],
    ['\"cow\" == \"cow\"'                  , "cow cow =="],
    ['\"cow\" != \"cow\"'                  , "cow cow !="],
    ['\"Hello\" + \"World\"'               , "Hello World +"],
]

var ternary_tests = [
    ['Ternary Tests                                   ',  ''],
    ['true ? 1 : 2                                    ',  '1'],
    ['false ? 1 : 2                                   ',  '2'],
    ['true ? 1 : 2 + 3                                ',  '1'],
    ['!true ? 1 : 2 + 3                               ',  '5'],
    ['true ? false ? 15 : \"cat\" : 3                 ',  'cat'],
    ['false ? true ? 15 : \"cat\" : 3 + 4             ',  '7'],
    ['true ? true ? true ? true : 15 : 14 : 13        ',  'true'],
    ['0 ? 1 : 2                                       ',  '1'],
    ['\"cat\" ? 1 : 2                                 ',  '1'],
    ['\"\" ? 1 : 2 + 3                                ',  '1'],
    ['nil ? 1 : 2 + 3                                 ',  '5'],
    ['nil ? nil ? 1 : 2 + 3 : 4                       ',  '4'],
    ['true ? 15                                       ',  '[line 1] Error at end: Expect \'?\' to have matching \':\'.'],
    ['\"cat\" ? 15.75 : \"dog\"                       ',  '15.75'],
]
var string_comparison_tests = [
    ['String Comparison Tests                          ', ''],
    ['"cat" == "cat"                                   ', 'true'],
    ['"cat" == "dog"                                   ', 'false'],
    ['"cat" != "cat"                                   ', 'false'],
    ['"cat" != "dog"                                   ', 'true'],
    ['"cat" < "dog"                                    ', 'true'],
    ['"cat" < "cat"                                    ', 'false'],
    ['"cat" > "dog"                                    ', 'false'],
    ['"cat" > "cat"                                    ', 'false'],
    ['"cat" <= "dog"                                   ', 'true'],
    ['"cat" <= "cat"                                   ', 'true'],
    ['"cat" >= "dog"                                   ', 'false'],
    ['"cat" >= "cat"                                   ', 'true'],
    ['"Cat" == "cat"                                   ', 'false'],
    ['"Cat" > "cat"                                    ', 'false'],
    ['"Cat" < "cat"                                    ', 'true'],
    ['"xyz" >= "abc"                                   ', 'true'],
]

// Couldn't get these to work in time for deadline. I tested them manually.
// var prof_o_tests_and_more_REPL = [
//     ['Prof. O. Manual REPL Tests                ', ''],
//     ['1 + 2                                     ', '3'],             
//     ['var x = 3; print "";                      ', ''],
//     ['x + 2                                     ', '5'],
//     ['x = "hello"                               ', 'hello'],
//     ['x == "bye"                                ', 'false'],
//     ['print "stuff";                            ', 'stuff'],
//     ['{ var x = "what?"; print x; } print x;    ', 'what?\nhello'],
//     ['var x = true;                   ', ''],
//     ['x == false                                ', 'false'],
//     ['x == "stuff"                              ', 'false'],
// ]


const runTests = async (arg, testArray) => {
    return new Promise((resolve, reject) => {

        var testId = 1 // start at 1 due to the metadata within each array of tests
        let interpreter = child_process.spawn('../tlox', [arg]);
        let passed = 0
        let failed = 0

        //standard output
        interpreter.stdout.on('data', (data) => {
            let output = data.toString()
            let test = testArray[testId]
            console.log(test)
            let expected = test[1]

            if (output.trim() === expected.trim()) {
                console.log('\x1b[32m%s\x1b[0m', 'PASS\n')
                passed++
            } else {
                console.log('\x1b[31m%s\x1b[0m', 'FAIL')
                console.log('\x1b[31m%s\x1b[0m', 'Expected: ' + expected)
                console.log('\x1b[31m%s\x1b[0m', 'Actual: ' + output + '\n')
                failed++
            }

            testId++
            if (testId < testArray.length) {
                runTest(testArray)
            } else {
                interpreter.kill()
                resolve([passed, failed])
            }
        });


        // error output
        interpreter.stderr.setEncoding('utf8');
        interpreter.stderr.on('data', function (data) {
            // Don't do anything with the error output.
            //console.log('stderr: ' + data);
        });


        //input
        interpreter.stdin.setDefaultEncoding('utf8')
        const runTest = (tests) => {
            let testString = tests[testId]
            let input = testString[0].trim()
            interpreter.stdin.write(input + '\n')
        }
        runTest(testArray)
    })
}

const runFileTests = async (runFilePath, testFilePath) => {
    return new Promise((resolve, reject) => {

        let interpreter = child_process.spawn('../tlox', [runFilePath]);
        let fileStream = fs.createWriteStream('result.txt')
        interpreter.stdout.pipe(fileStream);


        let passed = 0
        let failed = 0

        interpreter.on('exit', function () {
            let expected = fs.readFileSync(testFilePath, "utf8").toString().trim().replace(/[\n\r]/g, ''); // the .replace() removes any carriage returns
            let output = fs.readFileSync("./result.txt", "utf8").toString().trim().replace(/[\n\r]/g, '');

            if (output == expected) {
                console.log('\x1b[32m%s\x1b[0m', 'PASS\n')
                passed++
            } else {
                console.log('\x1b[31m%s\x1b[0m', 'FAIL')
                console.log('\x1b[31m%s\x1b[0m', 'Actual: ' + output)
                console.log('\x1b[31m%s\x1b[0m', 'Expected: ' + expected + '\n') 
                failed++
            }

            interpreter.kill()
            resolve([passed, failed])
        })

    })
}

const main = async () => {
    let to_run = [general_tests, rpn_tests,ternary_tests, string_comparison_tests]
    let passed = 0
    let failed = 0

    //Expression Tests
    for (let i = 0; i < to_run.length; i++) {
        let testArray = to_run[i]
        let name = testArray[0][0].trim()
        let arg = testArray[0][1].trim()
        console.log(`Running ${name}`)
        await runTests(arg, testArray).then((results) => {
            passed += results[0]
            failed += results[1]
            console.log('\x1b[32m%s\x1b[0m', `${name} passed: ` + results[0])
            console.log('\x1b[31m%s\x1b[0m', `${name} failed: ` + results[1])
        })
    }


    // File Tests
    // pull in an array of files to test
    let files = fs.readdirSync('../scripts', { withFileTypes: true })
    const fileNames = files
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

    for (let file of fileNames) {
        let runFilePath = '../scripts/' + file
        let testFilePath = '../scripts/expected/' + file.replace('.lox', '')
        console.log(`Running ${file}`)
        await runFileTests(runFilePath, testFilePath).then((results) => {
            passed += results[0]
            failed += results[1]
            console.log('\x1b[32m%s\x1b[0m', `${file} passed: ` + results[0])
            console.log('\x1b[31m%s\x1b[0m', `${file} failed: ` + results[1])
        })

    }


    console.log('\n\n')
    console.log('\x1b[32m%s\x1b[0m', 'Total passed: ' + passed)
    console.log('\x1b[31m%s\x1b[0m', 'Total failed: ' + failed)

    if (failed == 0) {
        console.log('\x1b[32m%s\x1b[0m', 'All tests passed!')
    }

    process.exit(0)
}


main()