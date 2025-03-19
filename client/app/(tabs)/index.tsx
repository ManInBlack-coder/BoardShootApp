import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from '@/components/Themed';
import HomeScreen from '../pages/HomeScreen';
import SignUpScreen from '../pages/SignUpScreen';
import SignInScreen from '../pages/SignInScreen';
import CameraScreen from '../pages/CameraScreen';
import SettingsScreen from '../pages/SettingsScreen';
import FoldersScreen from '../pages/FoldersScreen';

export type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  SignIn: undefined;
  Camera: undefined;
  Settings: undefined;
  Folders: undefined;
};

export default function App() {
  return (
   
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Folders" component={FoldersScreen} />

      
   </Stack.Navigator>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
