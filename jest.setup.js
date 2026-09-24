require('react-native-gesture-handler/jestSetup');
require('@shopify/flash-list/jestSetup');

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
