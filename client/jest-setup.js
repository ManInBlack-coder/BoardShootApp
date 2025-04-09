// Mock Expo Font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn().mockResolvedValue(true),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Suppress warnings in tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props) => {
      return <View testID={props.name} {...props} />;
    },
  };
});

// Mock image
jest.mock('@/assets/images/HomeBanner.webp', () => 'mock-image'); 