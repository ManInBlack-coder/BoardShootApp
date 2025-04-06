import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../config/axios';
import { debounce } from 'lodash';

// Marsruudi parameetrid DocumentView'le
type DocumentViewRouteProp = RouteProp<{
  Document: {
    folderId: number;
    noteId: number;
    title: string;
  }
}, 'Document'>;

const DocumentView = () => {
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);

  const route = useRoute<DocumentViewRouteProp>();
  const navigation = useNavigation();
  const { folderId, noteId, title } = route.params;

  // Dokumendi andmete laadimine serverist
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/folders/${folderId}/notes/${noteId}`);
        setDocument(response.data);
        
        // Võtame esimese tekstielemendi sisuna (kui on)
        if (response.data.texts && response.data.texts.length > 0) {
          setContent(response.data.texts[0]);
        } else {
          setContent('');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Dokumendi laadimine ebaõnnestus. Palun proovige hiljem uuesti.');
        Alert.alert('Viga', 'Dokumendi laadimine ebaõnnestus.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [folderId, noteId]);

  // Automaatne salvestamine, kui kasutaja lõpetab trükkimise
  const debouncedSave = useCallback(
    debounce(async (text: string) => {
      if (!document) return;
      
      setIsSaving(true);
      try {
        const response = await axiosInstance.put(`/api/folders/${folderId}/notes/${noteId}`, {
          text: text,
          title: document.title
        });
        
        // Uuendame dokumendi andmeid
        setDocument(response.data);
        console.log('Document saved successfully!');
      } catch (error) {
        console.error('Error saving document:', error);
        Alert.alert('Salvestamise viga', 'Dokumendi salvestamine ebaõnnestus. Palun proovige hiljem uuesti.');
      } finally {
        setIsSaving(false);
      }
    }, 1000), // Salvestame 1000ms (1 sekund) pärast viimast muudatust
    [document, folderId, noteId]
  );

  // Edastatakse sisu muudatus salvestamisfunktsioonile
  const handleContentChange = (text: string) => {
    setContent(text);
    debouncedSave(text);
  };
  
  // Dokumendi kustutamine
  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };
  
  const deleteDocument = async () => {
    try {
      await axiosInstance.delete(`/api/folders/${folderId}/notes/${noteId}`);
      console.log('Document deleted successfully');
      setIsDeleteModalVisible(false);
      
      Alert.alert('Õnnestus', 'Dokument on kustutatud', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Viga', 'Dokumendi kustutamine ebaõnnestus. Palun proovige hiljem uuesti.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{title || 'Dokument'}</Text>
        <View style={styles.headerActions}>
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="checkmark-circle" size={24} color="white" />
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005A2C" />
          <Text style={styles.loadingText}>Dokumendi laadimine...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Tagasi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.editor}
            multiline
            value={content}
            onChangeText={handleContentChange}
            placeholder="Alustage teksti sisestamist..."
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect
          />
        </ScrollView>
      )}
      
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kustuta dokument</Text>
            <Text style={styles.deleteText}>
              Kas olete kindel, et soovite kustutada dokumendi "{title}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Tühista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={deleteDocument}
              >
                <Text style={styles.buttonText}>Kustuta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#005A2C',
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  saveIndicator: {
    width: 40,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  editor: {
    flex: 1,
    minHeight: 400,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#005A2C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Kustutamise modaali stiilid
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
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  deleteModalButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DocumentView;

