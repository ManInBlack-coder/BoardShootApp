import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import HomeButton from "../components/HomeButton";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/(tabs)/index';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CameraScreen'>;

export default function SignInScreen() {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  
  return (
    <View style={styles.container}>
   
   <View style={styles.titleContainer}></View>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/HomeBanner.webp')}
          style={styles.image}
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4B5FBD" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>BOARDSHOOT</Text>
        </View>
      </View>
      <View style={styles.inputContainer}> 

      <TextInput 
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />

      </View>
  

      <TouchableOpacity style={styles.button}>
        <HomeButton title="Sign In" onPress={() => navigation.navigate('CameraScreen')} />
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Don't have an account? <Text style={styles.signUpText}>Sign Up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#00C898",
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: "#4B5FBD",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFFFFF",
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginTop: 70,
  },
  button: {
    padding: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    color: "#FFFFFF",
  },
  signUpText: {
    color: "#C28D00",
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: '23%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 0,
  },
  titleContainer: {
    position: 'absolute',
    top: '65%',
    left: '35%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 

