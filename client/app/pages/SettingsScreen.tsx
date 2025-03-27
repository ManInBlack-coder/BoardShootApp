import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/SettingsBanner.webp')} 
        style={styles.image} 
      />
      <Text style={styles.text}>BOARDSHOOT</Text>
      <Text style={styles.text2}>Personal Information</Text>
      
      {/* Box that acts as a button */}
      <TouchableOpacity style={styles.box} onPress={() => console.log("Button pressed!")}>
        <Text style={styles.boxText}>Rannu68</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#D9EDDF"
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
  box: {
    width: 300,
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#C28D00', 
    marginTop: 30, 
    borderRadius: 5, 
  },
  boxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  }
});
