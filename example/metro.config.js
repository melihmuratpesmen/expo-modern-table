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

config.resolver.extraNodeModules = {
  'expo-modern-table': libraryRoot,
};

module.exports = config;
