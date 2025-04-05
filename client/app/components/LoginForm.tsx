import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://example.com'; // Replace with your actual API URL

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Palun täitke kõik väljad');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`Sending login request to ${API_URL}/auth/login`);
      console.log(`Login payload: {"password": "******", "username": "${username}"}`);
      
      const response = await axios.post('/auth/login', {
        username,
        password
      });

      console.log('Login response:', JSON.stringify(response.data, null, 2));
      
      // Salvestame tokeni
      const token = response.data.token || response.data.accessToken;
      if (token) {
        await AsyncStorage.setItem('token', token);
        onLoginSuccess();
      } else {
        console.error('No token in response:', response.data);
        setError('Autentimine ebaõnnestus: token puudub vastuses');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Detailsem veatöötlus
      let errorMessage = 'Sisselogimine ebaõnnestus';
      
      if (error.response) {
        // Server vastas, aga koodiga väljaspool 2xx vahemikku
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          errorMessage = 'Vale kasutajanimi või parool';
        } else {
          errorMessage = `Serveri viga: ${error.response.status}`;
        }
      } else if (error.request) {
        // Päring tehti, aga vastust ei saadud
        console.log('No response received:', error.request);
        errorMessage = 'Server ei vastanud. Kontrollige serverühendust.';
      } else {
        // Midagi läks valesti päringu koostamise ajal
        console.log('Error message:', error.message);
        errorMessage = `Viga: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default LoginForm; 