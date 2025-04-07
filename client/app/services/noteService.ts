import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
// Eemaldame problemaatilise NetInfo impordi
// import NetInfo from '@react-native-community/netinfo';

// API baasaadressi määramine
// Võimalikud IP-d: 
// 1. app.json'is määratud apiUrl
// 2. app.json'is määratud serverIp põhjal ehitatud URL
// 3. Telefoni hotspot IP (172.20.10.x) - tüüpiline iPhone hotspot'i aadress
// 4. Tüüpiline koduruuteri IP 192.168.1.x
// 5. Localhost (töötab ainult emulaatorites)
const FALLBACK_IPS = ["172.20.10.10", "172.20.10.2", "172.20.10.1", "192.168.1.100", "localhost"];

// Kasutame esimesena app.json seadistust, seejärel proovime teisi IP-aadresse
const configApiUrl = Constants.expoConfig?.extra?.apiUrl;
const configServerIp = Constants.expoConfig?.extra?.serverIp;

let API_URL = '';

if (configApiUrl) {
  API_URL = configApiUrl;
  console.log("Kasutan app.json'is määratud API URL-i:", API_URL);
} else if (configServerIp) {
  API_URL = `http://${configServerIp}:8080/api`;
  console.log("Kasutan app.json'is määratud serveri IP-d:", configServerIp);
} else {
  // Kui konfiguratsioonis IP-d pole, kasutame esimest fallback IP-d
  API_URL = `http://${FALLBACK_IPS[0]}:8080/api`;
  console.log("Kasutan vaikimisi IP-d:", FALLBACK_IPS[0]);
}

console.log("API URL seadistatud:", API_URL);

// Võrguühenduse kontrollimise alternatiivne lahendus
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // Proovime kõigepealt ühenduda API serveriga
    try {
      console.log("Kontrollin ühendust API serveriga:", API_URL);
      const serverTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API Server Timeout')), 5000);
      });
      
      const serverFetchPromise = fetch(`${API_URL}/health`, { 
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      await Promise.race([serverFetchPromise, serverTimeoutPromise]);
      console.log('API server on kättesaadav');
      return true;
    } catch (serverError) {
      console.error('API server pole kättesaadav:', serverError);
      // Kui API server pole kättesaadav, proovime veel internetiühendust üldiselt kontrollida
    }

    // Proovime teha lihtsa fetch päringu, et kontrollida üldist võrguühendust
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 5000);
    });
    
    const fetchPromise = fetch('https://www.google.com', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    
    await Promise.race([fetchPromise, timeoutPromise]);
    console.log('Üldine võrguühendus on olemas, kuid API server pole kättesaadav');
    
    // Kuigi internet töötab, API server pole kättesaadav, seega tagastame false
    return false;
  } catch (error) {
    console.error('Võrguühenduse kontroll ebaõnnestus:', error);
    return false;
  }
};

// Abifunktsioon, et saada JWT token AsyncStorage'ist
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Funktsioon, mis teisendab URI pildi base64-ks
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log("Converting image URI to base64:", uri);
    
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log("Image blob size:", blob.size, "bytes");
    
    // Kontrollime, kas blob on liiga suur (> 5MB)
    if (blob.size > 5 * 1024 * 1024) {
      throw new Error("Image is too large (max 5MB)");
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Eemaldame base64 prefiks (nt. "data:image/jpeg;base64,")
          const resultString = reader.result;
          const base64Data = resultString.split(',')[1] || resultString;
          console.log("Base64 data length:", base64Data.length);
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert to base64'));
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting URI to base64:', error);
    throw error;
  }
};

// Teenus märkmete ja piltidega töötamiseks
export const noteService = {
  // Laadime kausta kõik märkmed
  getNotesForFolder: async (folderId: number) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_URL}/folders/${folderId}/notes`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  // Saame konkreetse märkme detailid
  getNote: async (folderId: number, noteId: number) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_URL}/folders/${folderId}/notes/${noteId}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  },

  // Loome uue märkme
  createNote: async (folderId: number, title: string, text?: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${API_URL}/folders/${folderId}/notes`,
        { title, text },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Lisame pildifaili märkmesse
  addImageToNote: async (folderId: number, noteId: number, imageUri: string) => {
    // Kontrolli võrguühendust enne päringu tegemist
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      console.error('No network connection available');
      throw new Error("Võrguühendus puudub. Palun kontrolli oma internetiühendust ja proovi uuesti.");
    }
    
    try {
      console.log("Starting image upload process for URI:", imageUri);
      
      // Teisendame URI base64 formaati
      const base64Image = await uriToBase64(imageUri);
      
      console.log("Image converted to base64, sending to server...");
      const headers = {
        ...(await getAuthHeader()),
        'Content-Type': 'application/json'
      };
      
      const payload = { image: base64Image };
      
      // Kontrollime andmeid enne saatmist
      if (!base64Image || base64Image.length === 0) {
        throw new Error("Image conversion failed - empty result");
      }
      
      console.log("Sending data to server, payload size:", JSON.stringify(payload).length, "bytes");
      
      // Kasutame taaskatsesüsteemi API päringule
      let retryCount = 0;
      const maxRetries = 3;
      let lastError;
      
      while (retryCount < maxRetries) {
        try {
          const response = await axios.post(
            `${API_URL}/folders/${folderId}/notes/${noteId}/images`,
            payload,
            { 
              headers,
              timeout: 30000 // 30 sekundit
            }
          );
          
          console.log("Server response:", response.status, response.data);
          return response.data;
        } catch (error) {
          lastError = error;
          retryCount++;
          console.warn(`Image upload attempt ${retryCount} failed, ${maxRetries - retryCount} retries left`);
          
          if (retryCount >= maxRetries) {
            break;
          }
          
          // Ootame enne järgmist katset
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Kui kõik katsed ebaõnnestusid, edastame viimase vea
      if (axios.isAxiosError(lastError)) {
        console.error('Axios error adding image to note:', 
          lastError.response?.status, 
          lastError.response?.data, 
          lastError.message
        );
        throw new Error(`Serveriga ühenduse viga: ${lastError.response?.data?.message || lastError.message}`);
      }
      throw lastError || new Error("Piltide üleslaadimine ebaõnnestus");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error adding image to note:', 
          error.response?.status, 
          error.response?.data, 
          error.message
        );
        // Täpsem veateade
        throw new Error(`Serveriga ühenduse viga: ${error.response?.data?.message || error.message}`);
      }
      console.error('Error adding image to note:', error);
      throw error;
    }
  },
  
  // Uuendame märkme andmeid
  updateNote: async (folderId: number, noteId: number, title?: string, text?: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.put(
        `${API_URL}/folders/${folderId}/notes/${noteId}`,
        { title, text },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  // Kustutame märkme
  deleteNote: async (folderId: number, noteId: number) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.delete(`${API_URL}/folders/${folderId}/notes/${noteId}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
};

// Cache'imise abifunktsioonid
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutit millisekundites

const getCachedData = async (key: string) => {
  try {
    const cachedDataStr = await AsyncStorage.getItem(key);
    if (!cachedDataStr) return null;
    
    const cachedData = JSON.parse(cachedDataStr);
    const now = new Date().getTime();
    
    // Kui andmed on kehtivad
    if (cachedData.timestamp && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log(`Using cached data for ${key}`);
      return cachedData.data;
    }
    
    console.log(`Cache expired for ${key}`);
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const setCachedData = async (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: new Date().getTime()
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`Data cached for ${key}`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// Kaustade teenus
export const folderService = {
  // Saame kõik kasutaja kaustad
  getFolders: async () => {
    const CACHE_KEY = 'folders_cache';
    
    try {
      // Proovime esmalt lugeda andmeid vahemälust
      const cachedFolders = await getCachedData(CACHE_KEY);
      if (cachedFolders && cachedFolders.length > 0) {
        console.log('Returning cached folders:', cachedFolders.length);
        return cachedFolders;
      }
      
      // Kontrolli võrguühendust
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.error('No network connection available for getFolders');
        throw new Error("Võrguühendus puudub. Palun kontrolli oma internetiühendust ja proovi uuesti.");
      }
      
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 sekund
      
      const attemptFetch = async (): Promise<any[]> => {
        try {
          console.log("Attempting to fetch folders...");
          const headers = await getAuthHeader();
          
          // Kontrolli, kas token on olemas
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            console.error("Authentication token missing");
            throw new Error("Autentimise viga. Palun logi uuesti sisse.");
          }
          
          console.log("API URL for folders:", `${API_URL}/folders`);
          console.log("Using token:", token.substring(0, 10) + '...');
          
          const response = await axios.get(`${API_URL}/folders`, {
            headers,
            timeout: 10000 // 10 sekundit timeout
          });
          
          console.log("Folders fetch successful:", response.status, "Count:", response.data?.length || 0);
          
          // Salvesta andmed vahemällu
          const folders = response.data || [];
          await setCachedData(CACHE_KEY, folders);
          
          return folders;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error('Network error fetching folders:', 
              error.code,
              error.message,
              'Status:', error.response?.status,
              'Data:', error.response?.data
            );
            
            // Kui server pole kättesaadav või võrguühendus puudub
            if (!error.response || error.code === 'ECONNABORTED') {
              throw new Error("Serveriga ei saa ühendust. Kontrolli võrguühendust.");
            }
            
            // Kui on autentimise probleem
            if (error.response.status === 401 || error.response.status === 403) {
              // Proovime tokenit värskendada või kustutada, et kasutaja saaks uuesti sisse logida
              await AsyncStorage.removeItem('token');
              throw new Error("Autentimise viga. Palun logi uuesti sisse.");
            }
          }
          
          console.error('Error fetching folders:', error);
          throw error;
        }
      };
      
      // Katsetame päringu tegemist mitu korda
      while (retryCount < maxRetries) {
        try {
          return await attemptFetch();
        } catch (error) {
          retryCount++;
          console.warn(`Folders fetch attempt ${retryCount} failed, ${maxRetries - retryCount} retries left`);
          
          // Kui oleme viimane katse, siis edastame vea
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Ootame enne järgmist katset
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
      
      // See kood ei tohiks kunagi käivituda, aga TypeScript vajab tagastust
      return [];
    } catch (error) {
      console.error("getFolders final error:", error);
      // Kui kõik ebaõnnestub, tagastame tühja massiivi, et rakendus kokku ei jookseks
      return [];
    }
  },
  
  // Laadime konkreetse kausta märkmed
  getNotesForFolder: async (folderId: number) => {
    const CACHE_KEY = `folder_notes_${folderId}`;
    
    // Proovime esmalt lugeda andmeid vahemälust
    const cachedNotes = await getCachedData(CACHE_KEY);
    if (cachedNotes) {
      console.log('Returning cached notes for folder', folderId);
      return cachedNotes;
    }
    
    try {
      // Kontrolli võrguühendust
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error("Võrguühendus puudub. Kontrolli internetiühendust.");
      }
      
      const headers = await getAuthHeader();
      const response = await axios.get(`${API_URL}/folders/${folderId}/notes`, {
        headers,
        timeout: 10000
      });
      
      // Salvesta andmed vahemällu
      const notes = response.data || [];
      await setCachedData(CACHE_KEY, notes);
      
      return notes;
    } catch (error) {
      console.error('Error fetching notes for folder:', error);
      throw error;
    }
  },
  
  // Loome uue kausta
  createFolder: async (name: string) => {
    // Kontrolli võrguühendust
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      throw new Error("Võrguühendus puudub. Kontrolli internetiühendust.");
    }
    
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${API_URL}/folders`,
        { name },
        { headers }
      );
      
      // Kustutame vahemälu, et järgmine päring saaks värskeid andmeid
      await AsyncStorage.removeItem('folders_cache');
      
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }
}; 