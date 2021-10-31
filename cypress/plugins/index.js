const trash = import('trash')
const path = require('path')
const { startDevServer } = require('@cypress/vite-dev-server')

module.exports = (on, config) => {
  on('before:run', ({ specs, config }) => {
    trash.then(i => i.default(specs.map(spec => path.join(
      config.screenshotsFolder,
      ...path.relative(
        config.component.componentFolder,
        spec.relative
      ).split(/[\\\/]/g)
    ))))
  })
  on('dev-server:start', (options) => {
    return startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(__dirname, '../../vite.config'),
      },
    })
  })

  return config
}
