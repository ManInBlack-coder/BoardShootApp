import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/types/types';
import React, { useState } from 'react';
import HomeButton from "../../components/HomeButton";

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSignIn = () => {
    // TODO: Implement sign in logic
    console.log('Sign in:', { email, password });
    navigation.navigate('MainScreen');
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
          <Text style={styles.label}>E-mail</Text>
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
          <View style={styles.passwordContainer}>
            <TextInput 
              style={[styles.input, styles.passwordInput]}
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={24} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signInButton}
          onPress={handleSignIn}
        >
         <HomeButton  title="Sign In" onPress={() => navigation.navigate('MainScreen')} />
         </TouchableOpacity>

         <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign In</Text>
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
  imageContainer: {
    width: '100%',
    height: '23%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
  logo: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  signInButton: {
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    flexDirection: 'row',
  },
  signUpLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFFFFF",
    marginBottom: 40,
    marginTop: 40,
  },
}); 

