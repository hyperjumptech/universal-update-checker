module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  env: {
    production: {
      ignore: [
        "**/*.test.js"
      ],
      sourceMaps: true
    }
  }
};
