import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../config/axios';
import { RootStackParamList } from '../../types/types';

interface FolderProps {
  id: number;
  name: string;
  count: number;
}

const FolderItem = ({ id, name, count }: FolderProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
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
  const [folders, setFolders] = useState<FolderProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderProps | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchFolders();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      console.log('FoldersScreen focused - refreshing folders');
      fetchFolders();
      return () => {
        // Puhastustegevus, kui ekraan kaotab fookuse
      };
    }, [])
  );

  const fetchFolders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/folders');
      console.log('Server response:', response.data);
      
      // Formaat vastuse järgi ja reaalne failide arvu lugemine
      const formattedFolders = await Promise.all(response.data.map(async (folder: any) => {
        // Loeme iga kausta failid eraldi, et saada täpne arv
        try {
          const notesResponse = await axiosInstance.get(`/api/folders/${folder.id}/notes`);
          const notesCount = notesResponse.data.length;
          
          return {
            id: folder.id,
            name: folder.name || 'Nimetu kaust',
            count: notesCount // Kasutame päris failide arvu, mitte notes array pikkust vastusest
          };
        } catch (error) {
          console.error(`Error fetching notes for folder ${folder.id}:`, error);
          return {
            id: folder.id,
            name: folder.name || 'Nimetu kaust',
            count: folder.notes?.length || 0
          };
        }
      }));
      
      setFolders(formattedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Ei saanud kaustu laadida. Palun proovige hiljem uuesti.');
      Alert.alert('Viga', 'Ei saanud kaustu laadida. Palun proovige hiljem uuesti.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFolder = () => {
    setIsModalVisible(true);
  };

  const createNewFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await axiosInstance.post('/api/folders', {
        name: newFolderName
      });
      
      console.log('Created folder:', response.data);
      
      setNewFolderName('');
      setIsModalVisible(false);
      fetchFolders(); // Värskendame kaustade nimekirja
    } catch (error) {
      console.error('Error creating folder:', error);
      Alert.alert('Viga', 'Ei saanud kausta luua. Palun proovige hiljem uuesti.');
    }
  };
  
  const handleLongPressFolder = (folder: FolderProps) => {
    setSelectedFolder(folder);
    setIsDeleteModalVisible(true);
  };
  
  const deleteFolder = async () => {
    if (!selectedFolder) return;
    
    try {
      const response = await axiosInstance.delete(`/api/folders/${selectedFolder.id}`);
      console.log('Deleted folder:', response.data);
      
      setIsDeleteModalVisible(false);
      setSelectedFolder(null);
      fetchFolders(); // Värskendame kaustade nimekirja
      
      Alert.alert('Õnnestus', 'Kaust koos failidega on kustutatud.');
    } catch (error) {
      console.error('Error deleting folder:', error);
      Alert.alert('Viga', 'Ei saanud kausta kustutada. Palun proovige hiljem uuesti.');
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const filteredFolders = folders.filter(folder => {
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Modifitseerime FolderItem komponenti, et reageerida pikale vajutusele
  const renderFolderItem = (folder: FolderProps) => (
    <TouchableOpacity 
      key={folder.id}
      style={styles.folderItem} 
      onPress={() => navigation.navigate('Files', { folderId: folder.id, folderName: folder.name })}
      onLongPress={() => handleLongPressFolder(folder)}
      delayLongPress={500}
    >
      <Ionicons name="folder" size={50} color="#005A2C" />
      <Text style={styles.folderName}>{folder.name}</Text>
      <Text style={styles.folderCount}>{folder.count} fail{folder.count !== 1 ? 'i' : ''}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={toggleSearch} style={styles.searchIcon}>
            <Ionicons name="search" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Folders</Text>
          <View style={styles.emptyIcon}></View>
        </View>
        
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Otsi kaustu..."
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
          <View style={styles.foldersContainer}>
            {filteredFolders.length > 0 ? (
              filteredFolders.map(folder => renderFolderItem(folder))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Kaustu pole veel loodud</Text>
                <TouchableOpacity 
                  style={styles.createFirstButton}
                  onPress={handleAddFolder}
                >
                  <Text style={styles.createFirstButtonText}>Loo esimene kaust</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={handleAddFolder}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uus Kaust</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Sisestage kausta nimi"
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
                <Text style={styles.buttonText}>Tühista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createNewFolder}
              >
                <Text style={styles.buttonText}>Loo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kustuta Kaust</Text>
            <Text style={styles.deleteText}>
              Kas olete kindel, et soovite kustutada kausta "{selectedFolder?.name}"? 
              Kõik selles kaustas olevad failid kustutatakse samuti.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setSelectedFolder(null);
                }}
              >
                <Text style={styles.buttonText}>Tühista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteFolder}
              >
                <Text style={styles.buttonText}>Kustuta</Text>
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
    flex: 1,
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
  foldersContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    marginBottom: 20,
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
    color: 'black',
  },
  folderCount: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    padding: 4,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#005A2C',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyIcon: {
    width: 24,
    height: 24,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  createFirstButton: {
    backgroundColor: '#005A2C',
    padding: 10,
    borderRadius: 5,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
});





