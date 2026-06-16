module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testTimeout: 30000,
  testPathIgnorePatterns: ["/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|react-native-svg|react-native-reanimated|react-native-worklets|lucide-react-native)/)"
  ]
};
