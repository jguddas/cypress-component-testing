const micromatch = require('micromatch')
const findRelated = require('./find-related')
const cypressConfig = require('./cypress.json')

const runRelatedCypressComponentTests = (stagedFiles) => findRelated(stagedFiles, {
  lookupExtensions: ['ts', 'tsx', 'js', 'jsx'],
  lookupRootDir: '.',
  lookupRoots: ['./src'],
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
}).then((relatedFiles) => {
  const testFiles = micromatch(
    [...relatedFiles, ...stagedFiles],
    cypressConfig.component.testFiles
  )
  if (!testFiles.length) return 'echo'
  return ['cypress run-ct', ...testFiles].join(' ')
});

module.exports = {
  '*': runRelatedCypressComponentTests
}
