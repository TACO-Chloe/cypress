const execa = require('execa')
const { chdir } = require('process')
const path = require('path')

const testResultsDestination = path.resolve(__dirname, 'test_results')

const REACT_PROJECTS_FOR_CI = [
  '', // root project
  '/examples/nextjs',
  '/examples/react-scripts',
  '/examples/webpack-file',
  '/examples/react-scripts-folder',
  '/examples/using-babel-typescript',
  '/examples/webpack-options',
  '/examples/rollup',
  '/examples/sass-and-ts',
]

const runTests = async (dir) => {
  try {
    chdir(dir)

    console.log(`Running yarn install in project ${dir}`)
    await execa('yarn', ['install', '--frozen-lockfile'], { stdout: 'inherit' })

    console.log(`Running yarn test in project ${dir}`)
    await execa('yarn', [
      'test',
      '--reporter',
      'cypress-circleci-reporter',
      '--reporter-options',
      `resultsDir=${testResultsDestination}`,
    ], { stdout: 'inherit' })
  } catch (e) {
    if (!e.stdout) {
      // for unexpected errors, just log the entire thing.
      console.error(e)
    } else {
      console.error(e.stdout)
      console.error(`Exiting with exit code ${e.exitCode}`)
      process.exit(e.exitCode)
    }
  }
}

const main = async () => {
  const NODE_INDEX = process.env.CIRCLE_NODE_INDEX

  // initial working directory is npm/react
  const projectDir = `${__dirname}${REACT_PROJECTS_FOR_CI[NODE_INDEX]}`

  console.log(`Running tests in ${projectDir}`)
  await runTests(projectDir)
}

// execute main function if called from command line
if (require.main === module) {
  main()
}
