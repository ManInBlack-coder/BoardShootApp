import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as authService from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/app/types/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  
  // Kasutaja andmete oleku muutujad
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false); 
  const [isEditingEmail, setIsEditingEmail] = useState(false); 
  const [newName, setNewName] = useState(''); 
  const [newEmail, setNewEmail] = useState(''); 
  const [isDayMode, setIsDayMode] = useState(true);

  // Laadime kasutaja andmed rakenduse käivitamisel
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setName(currentUser.username);
          setEmail(currentUser.email);
          setNewName(currentUser.username);
          setNewEmail(currentUser.email);
          setUserId(currentUser.id);
        } else {
          // Kui kasutaja pole sisselogitud, suuname ta avalehele
          Alert.alert("Viga", "Palun logi sisse, et seadeid muuta");
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert("Viga", "Kasutaja andmete laadimisel tekkis viga");
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, []);

  const handleEditNamePress = () => {
    setIsEditingName(true); 
  };

  const handleSaveNamePress = async () => {
    if (userId === null) {
      Alert.alert("Viga", "Kasutaja andmed puuduvad");
      return;
    }
    
    try {
      setUpdating(true);
      // Saadame uuendatud kasutajanime ja e-maili serverisse
      await authService.updateUserProfile(userId, newName, email);
      
      // Uuendame lokaalset olekut
      setName(newName);
      setIsEditingName(false);
      Alert.alert("Edu", "Kasutajanimi on edukalt uuendatud");
    } catch (error) {
      console.error('Update name error:', error);
      Alert.alert("Viga", "Kasutajanime uuendamisel tekkis viga");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditEmailPress = () => {
    setIsEditingEmail(true);
  };

  const handleSaveEmailPress = async () => {
    if (userId === null) {
      Alert.alert("Viga", "Kasutaja andmed puuduvad");
      return;
    }
    
    try {
      setUpdating(true);
      // Saadame uuendatud kasutajanime ja e-maili serverisse
      await authService.updateUserProfile(userId, name, newEmail);
      
      // Uuendame lokaalset olekut
      setEmail(newEmail);
      setIsEditingEmail(false);
      Alert.alert("Edu", "E-posti aadress on edukalt uuendatud");
    } catch (error) {
      console.error('Update email error:', error);
      Alert.alert("Viga", "E-posti aadressi uuendamisel tekkis viga");
    } finally {
      setUpdating(false);
    }
  };

  const toggleDayNightMode = () => {
    setIsDayMode(prevState => !prevState); 
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.navigate('Home');
      Alert.alert("Edu", "Oled edukalt välja logitud");
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert("Viga", "Väljalogimise ajal tekkis viga");
    }
  };

  // Kui andmeid laaditakse, näitame laadimisanimatsiooni
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#C28D00" />
        <Text style={styles.loadingText}>Andmete laadimine...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/SettingsBanner.webp')} 
        style={styles.image} 
      />
      <Text style={styles.text}>BOARDSHOOT</Text>
      <Text style={styles.text2}>Personal Information</Text>

      {/* Box with Name */}
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <TouchableOpacity onPress={handleEditNamePress} disabled={updating}>
            <FontAwesome name="pencil" size={20} color="white" style={styles.icon} />
          </TouchableOpacity>
          {!isEditingName ? (
            <Text style={styles.boxText}>{name}</Text>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                editable={!updating}
              />
              <TouchableOpacity onPress={handleSaveNamePress} disabled={updating}>
                {updating ? (
                  <ActivityIndicator size="small" color="green" style={styles.checkIcon} />
                ) : (
                  <FontAwesome name="check" size={20} color="green" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Box with Email */}
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <TouchableOpacity onPress={handleEditEmailPress} disabled={updating}>
            <FontAwesome name="pencil" size={20} color="white" style={styles.icon} />
          </TouchableOpacity>
          {!isEditingEmail ? (
            <Text style={styles.boxText}>{email}</Text>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                autoFocus
                editable={!updating}
              />
              <TouchableOpacity onPress={handleSaveEmailPress} disabled={updating}>
                {updating ? (
                  <ActivityIndicator size="small" color="green" style={styles.checkIcon} />
                ) : (
                  <FontAwesome name="check" size={20} color="green" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.text3}>Doc Light Mode</Text>

      <TouchableOpacity style={styles.box2} onPress={toggleDayNightMode}>
        <View style={styles.dayNightBox}>
          <FontAwesome name="sun-o" size={25} color="yellow" style={styles.sunIcon} />
          <View style={[styles.ovalBox, { backgroundColor: isDayMode ? 'white' : 'black' }]}>
            <TouchableOpacity 
              style={[styles.ball, { 
                backgroundColor: isDayMode ? 'black' : 'white', 
                alignSelf: isDayMode ? 'flex-start' : 'flex-end' 
              }]} 
              onPress={toggleDayNightMode}
            />
          </View>
          <FontAwesome name="moon-o" size={25} color="white" style={styles.moonIcon} />
        </View>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="white" style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Logi välja</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#D9EDDF"  // Default background color for the rest of the app
  },
  loadingContainer: {
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#C28D00"
  },
  image: {
    width: '100%', 
    height: 200, 
    resizeMode: 'cover', 
    position: 'absolute',
    top: 0,
  },
  text: {
    marginTop: 85, 
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFFFFF",
  },
  text2: {
    marginTop: 105, 
    fontSize: 16,
    fontWeight: 'bold',
    color: "black",
    marginRight: 180
  },
  text3: {
    marginTop: 80, 
    fontSize: 16,
    fontWeight: 'bold',
    color: "black",
    marginRight: 215
  },
  box: {
    width: 300,
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#C28D00', 
    marginTop: 30, 
    borderRadius: 5, // Oval shape for the entire box
    flexDirection: 'row', // Make sure the pencil icon and text are aligned horizontally
  },
  boxContent: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  icon: {
    marginLeft: -10,
  },
  boxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10, // Space between pencil and text
  },
  box2: {
    width: 300,
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#C28D00', 
    marginTop: 30, 
    borderRadius: 5, 
  },
  boxText2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  editContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25, // Oval shape
    width: 250,
    marginLeft: 8,
  },
  input: {
    fontSize: 18,
    color: 'black',
    width: 200,
    paddingLeft: 25,
  },
  checkIcon: {
    marginLeft: 10,
    color: "black",
  },
  // Day/Night Mode Box styles
  dayNightBox: {
    width: 300,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#C28D00',
    borderRadius: 25,
  },
  sunIcon: {
    marginLeft: 10,
  },
  moonIcon: {
    marginRight: 10,
  },
  ovalBox: {
    width: 150,
    height: 30,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ball: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  // Logout Button styles
  logoutButton: {
    width: 300,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C93838', // Punane värv väljalogimise nupule
    marginTop: 30,
    borderRadius: 5,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  logoutIcon: {
    marginRight: 5,
  }
});
