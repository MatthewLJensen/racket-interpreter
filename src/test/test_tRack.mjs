import * as child_process from 'child_process';
import * as fs from 'fs';


// const runTests = async (arg, testArray) => {
//     return new Promise((resolve, reject) => {

//         var testId = 1 // start at 1 due to the metadata within each array of tests
//         let interpreter = child_process.spawn('../tRack', [arg]);
//         let passed = 0
//         let failed = 0

//         //standard output
//         interpreter.stdout.on('data', (data) => {
//             let output = data.toString()
//             let test = testArray[testId]
//             console.log(test)
//             let expected = test[1]

//             if (output.trim() === expected.trim()) {
//                 console.log('\x1b[32m%s\x1b[0m', 'PASS\n')
//                 passed++
//             } else {
//                 console.log('\x1b[31m%s\x1b[0m', 'FAIL')
//                 console.log('\x1b[31m%s\x1b[0m', 'Expected: ' + expected)
//                 console.log('\x1b[31m%s\x1b[0m', 'Actual: ' + output + '\n')
//                 failed++
//             }

//             testId++
//             if (testId < testArray.length) {
//                 runTest(testArray)
//             } else {
//                 interpreter.kill()
//                 resolve([passed, failed])
//             }
//         });


//         // error output
//         interpreter.stderr.setEncoding('utf8');
//         interpreter.stderr.on('data', function (data) {
//             // Don't do anything with the error output.
//             //console.log('stderr: ' + data);
//         });


//         //input
//         interpreter.stdin.setDefaultEncoding('utf8')
//         const runTest = (tests) => {
//             let testString = tests[testId]
//             let input = testString[0].trim()
//             interpreter.stdin.write(input + '\n')
//         }
//         runTest(testArray)
//     })
// }

const runFileTests = async (runFilePath, testFilePath) => {
    return new Promise((resolve, reject) => {

        let interpreter = child_process.spawn('../tRack', [runFilePath]);
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
    let passed = 0
    let failed = 0
    // File Tests
    // pull in an array of files to test
    let files = fs.readdirSync('../scripts', { withFileTypes: true })
    const fileNames = files
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);

    for (let file of fileNames) {
        let runFilePath = 'C:\Users\Matthew\Documents\Local Programming\racket-interpreter\src\scripts' + file
        let testFilePath = '../scripts/expected/' + file.replace('.track', '')
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