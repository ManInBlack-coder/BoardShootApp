import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/(tabs)/index';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/HomeBanner.webp')}
          style={styles.image}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>BOARDSHOOT</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Your concepts will be noticed!</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#00C898",
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFFFFF",
    textAlign: "center",

  },
  titleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#C28D00",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
  },
  imageContainer: {
    width: '100%',
    height: '23%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});