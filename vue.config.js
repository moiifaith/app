const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    },
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hot: true,
    liveReload: true
  }
})
