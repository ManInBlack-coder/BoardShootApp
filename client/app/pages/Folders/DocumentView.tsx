import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Vibration } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../config/axios';
import { debounce } from 'lodash';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ImageView from "react-native-image-viewing";

// Ekraani mõõtmete hankimine
const { width: screenWidth } = Dimensions.get('window');

// Marsruudi parameetrid DocumentView'le
type DocumentViewRouteProp = RouteProp<{
  Document: {
    folderId: number;
    noteId: number;
    title: string;
  }
}, 'Document'>;

// Kohandatud RenderItemParams tüüp, mis sisaldab ka index parameetrit
interface CustomRenderItemParams<T> extends RenderItemParams<T> {
  index: number;
}

// Abifunktsioon pikkade URL-ide lühendamiseks
const truncateUrl = (url: string, maxLength: number = 30): string => {
  if (!url) return '';
  
  // Kui URL on lühem kui max pikkus, tagastame selle muutmata
  if (url.length <= maxLength) return url;
  
  // Base64 piltide puhul lühendame eriti
  if (url.startsWith('data:image')) {
    const prefix = 'data:image/jpeg;base64,';
    const dataPrefix = url.substring(0, prefix.length);
    const dataContent = url.substring(prefix.length);
    return `${dataPrefix}${dataContent.substring(0, 10)}...${dataContent.substring(dataContent.length - 5)} (${dataContent.length} märki)`;
  }
  
  // Tavaliste URL-ide puhul näitame algust ja lõppu
  return url.substring(0, maxLength / 2) + '...' + url.substring(url.length - maxLength / 2);
};

const DocumentView = () => {
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  
  // Piltide funktsionaalsuseks vajalikud olekud
  const [images, setImages] = useState<string[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [imageToDelete, setImageToDelete] = useState<{index: number, url: string} | null>(null);
  const [isDeleteImageModalVisible, setIsDeleteImageModalVisible] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const route = useRoute<DocumentViewRouteProp>();
  const navigation = useNavigation();
  const { folderId, noteId, title } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Jälgime klaviatuuri olekut
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
        
        // Salvestame pildid eraldi olekus, et neid oleks lihtsam manipuleerida
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          setImages(response.data.imageUrls);
          console.log(`Laaditi ${response.data.imageUrls.length} pilti märkmele ID: ${noteId}`);
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

  // Debounced version of image reorder function to limit server requests
  const debouncedImagesReorder = useCallback(
    debounce(async (newImages: string[]) => {
      try {
        console.log(`Muudan ${newImages.length} pildi järjekorda märkmes ID: ${noteId}`);
        
        // Saadame uuendatud järjekorra serverisse
        const response = await axiosInstance.put(`/api/folders/${folderId}/notes/${noteId}/images/reorder`, {
          imageUrls: newImages
        });
        
        console.log('Images reordered successfully:', response.data);
        
        // Uuendame dokumendi objekti
        if (document && response.data) {
          const updatedDocument = { ...document };
          updatedDocument.imageUrls = newImages;
          setDocument(updatedDocument);
        }
        
        // Näitame kasutajale lühikest kinnitust edukast salvestamisest
        setIsReordering(false);
      } catch (error) {
        console.error('Error reordering images:', error);
        
        // Detailsem logimise sõnum, et näha täpselt, mis päringuga saadeti
        console.log('Request was sent to:', `/api/folders/${folderId}/notes/${noteId}/images/reorder`);
        console.log('With data:', { imageUrls: newImages });
        
        Alert.alert('Viga', 'Piltide järjekorra muutmine ebaõnnestus.');
        
        // Kui serverisse saatmine ebaõnnestub, taastame dokumendi originaalse piltide järjekorra
        if (document?.imageUrls) {
          setImages(document.imageUrls);
        }
        
        setIsReordering(false);
      }
    }, 800), // Ootame 800ms enne serverisse saatmist
    [document, folderId, noteId]
  );

  // Pildi järjekorra muutmise funktsioon
  const handleImagesReorder = async (newImages: string[]) => {
    // Kohalik värskendus kohe
    setImages(newImages);
    
    // Näitame salvestamise olekut ainult esimese sekundi möödumisel
    const showReorderingTimeout = setTimeout(() => {
      setIsReordering(true);
    }, 500);
    
    // Väristame telefoni, et anda kasutajale tagasisidet
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50); // Lühike vibratsioon
    }
    
    // Käivitame debounce'itud funktsiooni, mis saadab andmed serverisse
    debouncedImagesReorder(newImages);
    
    // Puhastame timeout'i, kui debounce'itud funktsioon käivitub enne 500ms
    return () => clearTimeout(showReorderingTimeout);
  };
  
  // Pildi kustutamise funktsioon
  const handleImageDelete = (index: number, imageUrl: string) => {
    console.log(`Valmistun kustutama pilti indeksiga ${index} märkmest ID: ${noteId}`);
    setImageToDelete({ index, url: imageUrl });
    setIsDeleteImageModalVisible(true);
  };
  
  // Pildi kustutamise kinnitamise funktsioon
  const confirmImageDelete = async () => {
    if (imageToDelete === null) return;
    
    try {
      console.log(`Kustutan pildi indeksiga ${imageToDelete.index} märkmest ID: ${noteId}`);
      
      // Saadame serverisse päringu pildi kustutamiseks
      await axiosInstance.delete(`/api/folders/${folderId}/notes/${noteId}/images`, {
        data: { imageUrl: imageToDelete.url }
      });
      
      // Uuendame kohalikku pildi massiivi
      const updatedImages = [...images];
      updatedImages.splice(imageToDelete.index, 1);
      setImages(updatedImages);
      
      // Uuendame ka dokumendi objekti
      if (document) {
        const updatedDocument = { ...document };
        updatedDocument.imageUrls = updatedImages;
        setDocument(updatedDocument);
      }
      
      console.log('Image deleted successfully');
      Alert.alert('Õnnestus', 'Pilt kustutati');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Viga', 'Pildi kustutamine ebaõnnestus.');
    } finally {
      setIsDeleteImageModalVisible(false);
      setImageToDelete(null);
    }
  };
  
  // Klaviatuuri peitmine, kui kasutaja puudutab väljaspool tekstiala
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Renderdame iga pildi loendis
  const renderDraggableImage = ({ item, drag, isActive, index }: CustomRenderItemParams<string>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.9}
          delayLongPress={300}
          onLongPress={() => {
            drag();
            // Väristame telefoni, et anda kasutajale tagasisidet
            if (Platform.OS !== 'web') {
              Vibration.vibrate(50);
            }
          }}
          onPress={() => {
            setSelectedImageIndex(index);
            setImageViewerVisible(true);
          }}
          style={[
            styles.imageWrapper,
            isActive && styles.activeImageWrapper
          ]}
          disabled={isActive}
        >
          <View style={styles.dragHandleContainer}>
            <Ionicons name="menu" size={24} color="#666" />
            <Text style={styles.imageIndex}>{index + 1}</Text>
          </View>
          <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          {isActive && (
            <View style={styles.dragIndicator}>
              <Ionicons name="move" size={30} color="white" />
            </View>
          )}
          <TouchableOpacity
            style={styles.deleteImageButton}
            onPress={() => handleImageDelete(index, item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.contentContainer}>
            <ScrollView 
              style={styles.scrollView} 
              keyboardShouldPersistTaps="handled"
              ref={scrollViewRef}
              showsVerticalScrollIndicator={true}
              scrollEventThrottle={16}
              decelerationRate="normal"
              contentContainerStyle={styles.scrollViewContent}
            >
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
              
              {/* Piltide sektsioon on nüüd ScrollView sees */}
              {images.length > 0 && (
                <View style={styles.imagesSection} pointerEvents="box-none">
                  <View style={styles.imagesSectionHeader}>
                    <Text style={styles.imagesTitle}>Pildid</Text>
                    <Text style={styles.imagesHint}>
                      {isReordering ? 'Salvestamine...' : 'Hoia pikalt pilti, et seda liigutada'}
                    </Text>
                  </View>
                  
                  <GestureHandlerRootView style={styles.gestureRoot}>
                    <DraggableFlatList
                      data={images}
                      renderItem={renderDraggableImage as any}
                      keyExtractor={(item, index) => `image-${index}`}
                      onDragEnd={({ data }) => handleImagesReorder(data)}
                      horizontal={false}
                      numColumns={1}
                      containerStyle={styles.imagesContainer}
                      scrollEnabled={false}
                      activationDistance={20}
                      dragHitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      dragItemOverflow={true}
                    />
                  </GestureHandlerRootView>
                </View>
              )}
              
              {/* Navigeerimise nupp, mis võimaldab kiiresti üles kerida */}
              {images.length > 2 && (
                <TouchableOpacity 
                  style={styles.scrollToTopButton}
                  onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                >
                  <Ionicons name="chevron-up" size={24} color="white" />
                  <Text style={styles.scrollToTopText}>Keri üles</Text>
                </TouchableOpacity>
              )}
              
              {/* Lisame alumise ruumi, et oleks kerge alla kerida */}
              <View style={styles.spacer} />
            </ScrollView>
            
            {/* Valikuline klaviatuuri peitmise nupp */}
            {isKeyboardVisible && (
              <TouchableOpacity 
                style={styles.keyboardDismissButton}
                onPress={dismissKeyboard}
              >
                <Ionicons name="chevron-down" size={24} color="white" />
                <Text style={styles.keyboardDismissText}>Peida klaviatuur</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}
      
      {/* Pildi täisekraani kuvamine */}
      <ImageView
        images={images.map(url => ({ uri: url }))}
        imageIndex={selectedImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        presentationStyle="overFullScreen"
        FooterComponent={({ imageIndex }) => (
          <View style={styles.imageViewerFooter}>
            <Text style={styles.imageViewerText}>
              {imageIndex + 1} / {images.length}
            </Text>
            <TouchableOpacity 
              style={styles.imageViewerDeleteButton}
              onPress={() => {
                setImageViewerVisible(false);
                setTimeout(() => {
                  handleImageDelete(imageIndex, images[imageIndex]);
                }, 300);
              }}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
              <Text style={styles.imageViewerButtonText}>Kustuta</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      {/* Dokumendi kustutamise modal */}
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
      
      {/* Pildi kustutamise modal */}
      <Modal
        visible={isDeleteImageModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kustuta pilt</Text>
            <Text style={styles.deleteText}>
              Kas olete kindel, et soovite kustutada selle pildi?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteImageModalVisible(false)}
              >
                <Text style={styles.buttonText}>Tühista</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={confirmImageDelete}
              >
                <Text style={styles.buttonText}>Kustuta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
  editor: {
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
    paddingBottom: 30,
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
  keyboardDismissButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#005A2C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  keyboardDismissText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  spacer: {
    height: 100, // Alumine ruum, et kerida teksti klaviatuuri alt välja
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
  imagesSection: {
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  imagesHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  imagesContainer: {
    width: '100%',
  },
  imageWrapper: {
    width: '98%',
    aspectRatio: 16/9,
    marginBottom: 20,
    marginHorizontal: '1%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeImageWrapper: {
    borderColor: '#005A2C',
    borderWidth: 3,
    opacity: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    transform: [{ scale: 1.05 }],
    zIndex: 999,
  },
  dragIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  imageIndex: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#666',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageViewerFooter: {
    height: 60,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageViewerText: {
    color: 'white',
    fontSize: 16,
  },
  imageViewerDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 5,
  },
  imageViewerButtonText: {
    color: 'white',
    marginLeft: 5,
  },
  gestureRoot: {
    minHeight: 200,
  },
  scrollToTopButton: {
    alignSelf: 'center',
    backgroundColor: '#005A2C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollToTopText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default DocumentView;

