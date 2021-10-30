const path = require('path')
const resolve = require('resolve')
const HasteMap = require('jest-haste-map').default

module.exports = async (inputFiles, options) => {
  const {
    lookupExtensions,
    lookupRootDir,
    lookupRoots,
    resolveExtensions,
  } = options

  // lookup all files and dependencies
  const { hasteFS } = await HasteMap.create({
    extensions: lookupExtensions,
    maxWorkers: 1,
    name: 'mapper',
    platforms: ['web'],
    retainAllFiles: true,
    rootDir: lookupRootDir,
    roots: lookupRoots,
  }).build();

  // format files and dependencies
  const moduleMap = [];
  for (const file of hasteFS.getAbsoluteFileIterator()) {
    moduleMap.push({
      dependencies: hasteFS.getDependencies(file).map((dep) =>
        resolve.sync(dep, {
          basedir: path.dirname(file),
          extensions: resolveExtensions,
        })
      ),
      file: resolve.sync(file),
    });
  }

  // find related files
  let changed = new Set(inputFiles);
  const visitedModules = new Set();
  const result = [];
  while (changed.size) {
    changed = new Set(
      moduleMap.reduce((acc, module) => {
        if (
          !visitedModules.has(module.file) &&
          module.dependencies.some((dep) => changed.has(dep))
        ) {
          result.push(module.file);
          visitedModules.add(module.file);
          acc.push(module.file);
        }
        return acc;
      }, [])
    );
  }

  return result
};
