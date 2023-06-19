const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  runtimeCompiler: true,
  devServer: {
    allowedHosts: "all",
  },
  // configureWebpack: {
  //   devtool: "source-map",
  // },
});
