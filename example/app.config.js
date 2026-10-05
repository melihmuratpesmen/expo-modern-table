// Static web export for GitHub Pages is served from a sub-path:
//   EXPO_BASE_URL=/expo-modern-table/demo npx expo export --platform web
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
