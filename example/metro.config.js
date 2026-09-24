const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Hot-reload library source while developing against Expo Go
config.watchFolders = [libraryRoot];

// Resolve native deps only from the example app (Expo Go SDK versions)
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// Never pick peer copies from the library package's own node_modules
config.resolver.blockList = [
  new RegExp(`${path.resolve(libraryRoot, 'node_modules').replace(/[/\\]/g, '[/\\\\]')}[/\\\\].*`),
];

// Resolve the library explicitly: TypeScript source by default for live editing, or the
// built entry with `EXAMPLE_USE_LIB=1` to smoke-test what consumers get (run
// `npm run build` in the library first). Explicit because Expo Metro also applies the
// tsconfig `paths` entry, which points at the source.
const libraryEntry =
  process.env.EXAMPLE_USE_LIB === '1'
    ? path.join(libraryRoot, 'lib', 'module', 'index.js')
    : path.join(libraryRoot, 'src', 'index.ts');
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-modern-table') {
    return { type: 'sourceFile', filePath: libraryEntry };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
