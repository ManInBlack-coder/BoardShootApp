import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {useState} from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/types/types'
import HomeScreen from "./HomeScreen";
type SingUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SingUpScreenNavigationProp>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  
  const handleRegister = () => {
    // TODO: Implement registration logic
    console.log('Register:', { name, email, password, agreeToTerms });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('@/assets/images/HomeBanner.webp')}
          style={styles.image}
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24}   color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>BOARDSHOOT</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={styles.termsContainer}
          onPress={() => setAgreeToTerms(!agreeToTerms)}
        >
          <View style={styles.checkbox}>
            {agreeToTerms && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            I agree with <Text style={styles.termsLink}>Terms & Privacy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C898',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 100,

  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#1B4332',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    color: '#fff',
    fontSize: 16,
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#C28D00',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
  },
  signInLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '120%',
    height: 350,
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
    color: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFFFFF",
    marginBottom: 40,
    marginTop: 40,

  },
  imageContainer: {
    width: '100%',
    height: '23%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
