import { View, Text, StyleSheet } from "react-native";

export default function FoldersScreen() {
  return <View style={styles.container}> <Text>Here is folders screen</Text></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

