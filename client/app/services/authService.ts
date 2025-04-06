import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TOKEN_KEY, USER_KEY } from '@/app/config/constants';
import axiosInstance from '../config/axios';

// Kasutaja tüüp
export type User = {
  id: number;
  username: string;
  email: string;
};

// Autentimise vastuste tüübid
type AuthResponse = {
  token: string;
  user: User;
};

/**
 * Kasutaja registreerimine
 */
export const register = async (username: string, email: string, password: string): Promise<User> => {
  try {
    console.log(`Sending registration request to ${API_URL}/auth/signup`);
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    console.log('Registration response status:', response.status);
    
    const responseText = await response.text();
    console.log('Registration response:', responseText);
    
    if (!response.ok) {
      throw new Error(responseText || 'Registration failed');
    }

    // Proovime vastust JSON-ina parsida
    let data;
    try {
      data = JSON.parse(responseText) as AuthResponse;
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Server response format error');
    }
    
    // Salvestame tokeni ja kasutaja info
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Kasutaja sisselogimine
 */
export const login = async (username: string, password: string): Promise<User> => {
  try {
    console.log(`Sending login request to ${API_URL}/auth/login`);
    console.log('Login payload:', { username, password: '******' });
    
    // Kasuta fetch asemel axiose instantsi
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Luba CORS päringud
      withCredentials: false,
      // Pikendame timeout'i
      timeout: 30000,
    });

    console.log('Login response status:', response.status);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));
    
    const data = response.data as AuthResponse;
    
    // Salvestame tokeni ja kasutaja info
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Detailsem veatöötlus
    if (error.response) {
      // Server vastas, aga koodiga väljaspool 2xx vahemikku
      console.log('Error response data:', error.response.data);
      console.log('Error response status:', error.response.status);
      throw new Error(error.response.data?.message || `Server vastus: ${error.response.status}`);
    } else if (error.request) {
      // Päring tehti, aga vastust ei saadud
      console.log('No response received:', error.request);
      throw new Error('Server ei vastanud. Kontrollige, kas server on käivitatud aadressil ' + API_URL);
    } else {
      // Midagi läks valesti päringu koostamise ajal
      console.log('Error message:', error.message);
      throw new Error(`Võrgu viga: ${error.message}`);
    }
  }
};

/**
 * Kasutaja väljalogmine
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Kasutaja profiili hankimine
 */
export const getProfile = async (): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to get profile');
    }

    const user = await response.json() as User;
    
    // Uuendame salvestatud kasutaja info
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Kontrollib, kas kasutaja on sisse logitud
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Tagastab salvestatud kasutaja info
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Tagastab salvestatud tokeni
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * Kasutaja andmete uuendamine
 */
export const updateUserProfile = async (userId: number, username: string, email: string): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Kasutame uut /profile endpointi, mis ei muuda parooli
    const response = await fetch(`${API_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        email
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to update profile');
    }

    const updatedUser = await response.json() as User;
    
    // Uuendame salvestatud kasutaja info
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    return updatedUser;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}; 