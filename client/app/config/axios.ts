import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';

// Loome Axiose instantsi
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Lisame interceptori, mis lisab JWT tokeni päistesse
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Lisa debug info võrguühenduse probleemide tuvastamiseks
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.log('Axios Error:', JSON.stringify(error, null, 2));
        if (error.message === 'Network Error' || error.message.includes('Network request failed')) {
            console.log('Võrguühenduse probleem: veenduge, et server töötab aadressil ' + API_URL);
        }
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized API request - logging out');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 