import { View, Text, StyleSheet, Image, TouchableOpacity, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/types/types'
import HomeButton from "../../components/HomeButton";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageSection}>
          <Image 
            source={require('../../assets/images/HomeBanner.webp')}
            style={styles.image}
          />
          <View style={styles.overlay} />
          <Text style={styles.logo}>BOARDSHOOT</Text>
        </View>

        <View style={styles.messageSection}>
          <Text style={styles.message}>Your concepts will be noticed!</Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <HomeButton title="Start" onPress={() => navigation.navigate('SignIn')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00C898",
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  imageSection: {
    width: '100%',
    height: '50%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  logo: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    bottom: '20%',
    fontSize: 35,
    fontWeight: 'bold',
    color: "#FFFFFF",
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  messageSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  message: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: '500',
    lineHeight: 40,
  },
  startButton: {
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%',
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: '600',
  },
});