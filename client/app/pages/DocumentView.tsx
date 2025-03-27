import { View, Text, StyleSheet } from 'react-native';

const DocumentView = () => {
  return (
    <View style={styles.container}>
      <Text>Document View</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default DocumentView;

