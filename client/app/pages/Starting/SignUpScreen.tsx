import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, {useState} from "react";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/types/types'
import * as authService from '../../services/authService';

type SingUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SingUpScreenNavigationProp>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRegister = async () => {
    // Valideerimine
    if (!username || !email || !password) {
      Alert.alert("Viga", "Palun täida kõik väljad");
      return;
    }
    
    if (!agreeToTerms) {
      Alert.alert("Viga", "Kasutustingimustega nõustumine on vajalik");
      return;
    }
    
    // Lihtne e-posti valideerimine
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Viga", "Palun sisesta korrektne e-posti aadress");
      return;
    }
    
    // Lihtne parooli tugevuse kontroll
    if (password.length < 6) {
      Alert.alert("Viga", "Parool peab olema vähemalt 6 märki pikk");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Kasuta autentimisteenust
      await authService.register(username, email, password);
      
      // Suuna peaekraanile eduka registreerimise järel
      navigation.navigate('MainScreen');
    } catch (error) {
      // Näita veateadet
      if (error instanceof Error) {
        Alert.alert("Viga registreerimisel", error.message);
      } else {
        Alert.alert("Viga registreerimisel", "Midagi läks valesti. Proovi uuesti.");
      }
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.backText}>Tagasi</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>BOARDSHOOT</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kasutajanimi</Text>
          <TextInput
            style={styles.input}
            placeholder="Sinu kasutajanimi"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-post</Text>
          <TextInput
            style={styles.input}
            placeholder="sinu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Parool</Text>
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
            Nõustun <Text style={styles.termsLink}>kasutustingimustega</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Registreeri</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Juba on konto? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInLink}>Logi sisse</Text>
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
  disabledButton: {
    backgroundColor: '#9e7100',
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
