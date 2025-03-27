import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [name, setName] = useState('Rannu68');
  const [email, setEmail] = useState('Rannu@gmail.com');
  const [isEditingName, setIsEditingName] = useState(false); 
  const [isEditingEmail, setIsEditingEmail] = useState(false); 
  const [newName, setNewName] = useState(name); 
  const [newEmail, setNewEmail] = useState(email); 
  const [isDayMode, setIsDayMode] = useState(true);

  const handleEditNamePress = () => {
    setIsEditingName(true); // Enable editing when pencil icon is pressed for name
  };

  const handleSaveNamePress = () => {
    setName(newName); // Save the new name
    setIsEditingName(false); // Stop editing when checkmark is pressed for name
  };

  const handleEditEmailPress = () => {
    setIsEditingEmail(true); // Enable editing when pencil icon is pressed for email
  };

  const handleSaveEmailPress = () => {
    setEmail(newEmail); // Save the new email
    setIsEditingEmail(false); // Stop editing when checkmark is pressed for email
  };

  const toggleDayNightMode = () => {
    setIsDayMode(prevState => !prevState); // Toggle between day and night mode
  };

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
          <TouchableOpacity onPress={handleEditNamePress}>
            <Ionicons name="pencil" size={20} color="white" style={styles.icon} />
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
              />
              <TouchableOpacity onPress={handleSaveNamePress}>
                <Ionicons name="checkmark" size={20} color="green" style={styles.checkIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Box with Email */}
      <View style={styles.box}>
        <View style={styles.boxContent}>
          <TouchableOpacity onPress={handleEditEmailPress}>
            <Ionicons name="pencil" size={20} color="white" style={styles.icon} />
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
              />
              <TouchableOpacity onPress={handleSaveEmailPress}>
                <Ionicons name="checkmark" size={20} color="green" style={styles.checkIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.text3}>Doc Light Mode</Text>

      <TouchableOpacity style={styles.box2} onPress={toggleDayNightMode}>
        <View style={styles.dayNightBox}>
          <Ionicons name="sunny" size={25} color="yellow" style={styles.sunIcon} />
          <View style={[styles.ovalBox, { backgroundColor: isDayMode ? 'white' : 'black' }]}>
            <TouchableOpacity 
              style={[styles.ball, { 
                backgroundColor: isDayMode ? 'black' : 'white', 
                alignSelf: isDayMode ? 'flex-start' : 'flex-end' 
              }]} 
              onPress={toggleDayNightMode}
            />
          </View>
          <Ionicons name="moon" size={25} color="white" style={styles.moonIcon} />
        </View>
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
  }
});
