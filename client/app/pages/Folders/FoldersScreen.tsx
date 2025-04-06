import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import axiosInstance from '../../config/axios';

interface FolderProps {
  id: number;
  name: string;
  count: number;
}

const FolderItem = ({ id, name, count }: FolderProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  
  return (
    <TouchableOpacity 
      style={styles.folderItem} 
      onPress={() => navigation.navigate('Files', { folderId: id, folderName: name })}
    >
      <Ionicons name="folder" size={50} color="#666" />
      <Text style={styles.folderName}>{name}</Text>
      <Text style={styles.folderCount}>{count}</Text>
    </TouchableOpacity>
  );
};

export default function FoldersScreen() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folders, setFolders] = useState<FolderProps[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/folders');
      console.log('Server response:', response.data);
      
      const foldersWithCount = response.data.map((folder: any) => ({
        id: folder.id,
        name: folder.name,
        count: folder.notes?.length || 0 // Kui notes pole määratud, kasutame 0
      }));
      
      setFolders(foldersWithCount);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Ei saanud kaustu laadida. Palun proovige hiljem uuesti.');
      Alert.alert('Viga', 'Ei saanud kaustu laadida. Palun proovige hiljem uuesti.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await axiosInstance.post('/api/folders', { name: newFolderName });
      console.log('Created folder:', response.data);
      
      setNewFolderName('');
      setIsModalVisible(false);
      fetchFolders(); // Värskendame kaustade loetelu
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Viga', 'Ei saanud kausta luua. Palun proovige hiljem uuesti.');
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const filteredFolders = folders.filter(folder => {
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={toggleSearch} style={styles.searchIcon}>
            <Ionicons name="search" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Folders</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search folders..."
              autoFocus
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005A2C" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFolders}>
            <Text style={styles.retryButtonText}>Proovi uuesti</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.gridContainer}>
            {filteredFolders.map((folder) => (
              <FolderItem key={folder.id} {...folder} />
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter folder name"
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setNewFolderName('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createNewFolder}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#e8f5e9',
 },
 header: {
   padding: 16,
   backgroundColor: '#005A2C',
 },
 headerContent: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
 },
 searchIcon: {
   padding: 4,
 },
 title: {
   fontSize: 24,
   color: 'white',
   textAlign: 'center',
 },
 searchContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: 'white',
   borderRadius: 8,
   padding: 8,
   marginTop: 10,
 },
 searchInput: {
   flex: 1,
   fontSize: 16,
 },
 scrollView: {
   flex: 1,
 },
 gridContainer: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   padding: 16,
 },
 folderItem: {
   width: '30%',
   aspectRatio: 1,
   margin: '1.66%',
   backgroundColor: 'white',
   borderRadius: 8,
   padding: 8,
   alignItems: 'center',
   justifyContent: 'center',
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.25,
   shadowRadius: 3.84,
   elevation: 5,
 },
 folderName: {
   marginTop: 8,
   fontSize: 14,
   textAlign: 'center',
 },
 folderCount: {
   fontSize: 12,
   color: '#666',
 },
 footer: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   padding: 16,
   backgroundColor: '#66bb6a',
 },
 footerButton: {
   padding: 8,
   backgroundColor: 'white',
   borderRadius: 20,
   width: 40,
   height: 40,
   alignItems: 'center',
   justifyContent: 'center',
 },
 addButton: {
   padding: 4,
 },
 modalContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
 },
 modalContent: {
   backgroundColor: 'white',
   padding: 20,
   borderRadius: 10,
   width: '80%',
 },
 modalTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   marginBottom: 15,
   textAlign: 'center',
 },
 modalInput: {
   borderWidth: 1,
   borderColor: '#ccc',
   borderRadius: 5,
   padding: 10,
   marginBottom: 15,
 },
 modalButtons: {
   flexDirection: 'row',
   justifyContent: 'space-between',
 },
 modalButton: {
   padding: 10,
   borderRadius: 5,
   width: '45%',
 },
 cancelButton: {
   backgroundColor: '#ff6b6b',
 },
 createButton: {
   backgroundColor: '#005A2C',
 },
 buttonText: {
   color: 'white',
   textAlign: 'center',
   fontWeight: 'bold',
 },
 loadingContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 errorContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 20,
 },
 errorText: {
   fontSize: 16,
   color: '#e74c3c',
   textAlign: 'center',
   marginBottom: 15,
 },
 retryButton: {
   backgroundColor: '#005A2C',
   padding: 10,
   borderRadius: 5,
 },
 retryButtonText: {
   color: 'white',
   fontWeight: 'bold',
 },
});





