import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from '@/components/Themed';
import HomeScreen from '../pages/Starting/HomeScreen';
import SignUpScreen from '../pages/Starting/SignUpScreen';
import SignInScreen from '../pages/Starting/SignInScreen';
import CameraScreen from '../pages/Camera/CameraScreen';
import SettingsScreen from '../pages/Settings/SettingsScreen';
import FoldersScreen from '../pages/Folders/FoldersScreen';
import FilesScreen from '../pages/Folders/FilesScreen';
import MainScreen from '../pages/General/MainScreen';
import { RootStackParamList } from '../types/types';
import DocumentView from '../pages/Folders/DocumentView';



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
      <Stack.Screen name="Files" component={FilesScreen} />
      <Stack.Screen name="Document" component={DocumentView} />
      <Stack.Screen name="MainScreen" component={MainScreen} />
      
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
