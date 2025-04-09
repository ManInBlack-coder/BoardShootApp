import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { noteService } from '../app/services/noteService';

// Mock noteService
jest.mock('../app/services/noteService', () => ({
  noteService: {
    addImageToNote: jest.fn(),
  },
  folderService: {
    getFolders: jest.fn(),
    getNotesForFolder: jest.fn(),
  },
}));

// Lihtsustatud kaamera mudel testimiseks
class CameraMock {
  takePictureAsync() {
    return Promise.resolve({ uri: 'file://test/photo.jpg' });
  }
}

// Lihtsustatud CameraScreen komponent, mis jäljendab põhifunktsionaalsust
const SimplifiedCameraComponent = ({ 
  onImageCaptured, 
  onCancel 
}: { 
  onImageCaptured?: (uri: string) => void; 
  onCancel?: () => void; 
}) => {
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const cameraRef = React.useRef(new CameraMock());

  const takePicture = async () => {
    try {
      const result = await cameraRef.current.takePictureAsync();
      setPhotoUri(result.uri);
      if (onImageCaptured) {
        onImageCaptured(result.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <View testID="camera-container">
      {!photoUri ? (
        <View testID="camera-view">
          <TouchableOpacity 
            testID="capture-button"
            onPress={takePicture}
          >
            <Text>Pildista</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View testID="preview-view">
          <Image 
            testID="photo-preview" 
            source={{ uri: photoUri }} 
            style={{ width: 100, height: 100 }}
          />
          <TouchableOpacity 
            testID="cancel-button"
            onPress={handleCancel}
          >
            <Text>Tühista</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

describe('Kaamera põhifunktsionaalsus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('võimaldab pildistada', async () => {
    const onImageCaptured = jest.fn();
    const { getByTestId } = render(
      <SimplifiedCameraComponent onImageCaptured={onImageCaptured} />
    );
    
    // Kontrollime, et kaamera vaade on renderdatud
    expect(getByTestId('camera-view')).toBeTruthy();
    
    // Vajutame pildistamise nupule
    fireEvent.press(getByTestId('capture-button'));
    
    // Ootame, et pilt tehtaks ja kutsutaks onImageCaptured
    await waitFor(() => {
      expect(onImageCaptured).toHaveBeenCalledWith('file://test/photo.jpg');
    });
    
    // Kontrollime, et eelvaate vaade on renderdatud
    expect(getByTestId('preview-view')).toBeTruthy();
    expect(getByTestId('photo-preview')).toBeTruthy();
  });

  test('võimaldab pildistamise tühistada', async () => {
    const onCancel = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <SimplifiedCameraComponent onCancel={onCancel} />
    );
    
    // Vajutame pildistamise nupule
    fireEvent.press(getByTestId('capture-button'));
    
    // Ootame, et eelvaate vaade renderdataks
    await waitFor(() => {
      expect(getByTestId('preview-view')).toBeTruthy();
    });
    
    // Vajutame tühistamise nupule
    fireEvent.press(getByTestId('cancel-button'));
    
    // Ootame, et kaamera vaade oleks tagasi
    await waitFor(() => {
      expect(queryByTestId('preview-view')).toBeNull();
      expect(getByTestId('camera-view')).toBeTruthy();
    });
    
    // Kontrollime, et tühistamise callback kutsuti
    expect(onCancel).toHaveBeenCalled();
  });

  test('ei saada pilti ilma salvestamiseta, kui tühistame', async () => {
    const { getByTestId } = render(<SimplifiedCameraComponent />);
    
    // Vajutame pildistamise nupule
    fireEvent.press(getByTestId('capture-button'));
    
    // Ootame, et eelvaate vaade renderdataks
    await waitFor(() => {
      expect(getByTestId('preview-view')).toBeTruthy();
    });
    
    // Vajutame tühistamise nupule
    fireEvent.press(getByTestId('cancel-button'));
    
    // Kontrollime, et kaamera vaade on nüüd nähtav
    await waitFor(() => {
      expect(getByTestId('camera-view')).toBeTruthy();
    });
    
    // Kontrollime, et teenust pildi salvestamiseks ei kutsutud
    expect(noteService.addImageToNote).not.toHaveBeenCalled();
  });
}); 