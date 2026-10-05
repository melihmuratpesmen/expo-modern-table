module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo adds the worklets (Reanimated) plugin automatically.
  return { presets: ['babel-preset-expo'] };
};
