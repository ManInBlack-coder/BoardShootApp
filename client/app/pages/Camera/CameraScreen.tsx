import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

interface PhotoType {
    uri: string;
}

// Mock folders data
const MOCK_FOLDERS = [
    { id: '1', name: 'Mata' },
    { id: '2', name: 'Eesti keel' },
    { id: '3', name: 'Progre' },
];

// Mock file types data
const MOCK_FILE_TYPES = [
    { id: '1', name: 'Trigo' },
    { id: '2', name: 'Jadad' },
    { id: '3', name: 'Eksponent' },
];

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = React.useState<CameraType>('back');
    const [photo, setPhoto] = React.useState<string | null>(null);
    const [showFolders, setShowFolders] = useState(false);
    const [showFileTypes, setShowFileTypes] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const result = await cameraRef.current.takePictureAsync();
                const photoData = result as PhotoType;
                setPhoto(photoData.uri);
                console.log('Photo taken:', photoData.uri);
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    const handleCancel = () => {
        setPhoto(null);
        setSelectedFolder(null);
        setSelectedFileType(null);
        setShowFileTypes(false);
    };

    const handleChooseFolder = () => {
        setShowFolders(true);
        setShowFileTypes(false);
    };

    const handleFolderSelect = (folderName: string) => {
        setSelectedFolder(folderName);
        setShowFolders(false);
        setShowFileTypes(true);  // Show file types after selecting a folder
    };

    const handleFileTypeSelect = (fileType: string) => {
        setSelectedFileType(fileType);
        setShowFileTypes(false);
    };

    const handleBackToFolders = () => {
        setShowFileTypes(false);
        setShowFolders(true);
        setSelectedFileType(null);
    };

    const handleSend = () => {
        if (selectedFolder && photo && selectedFileType) {
            console.log('Sending photo:', photo, 'to folder:', selectedFolder, 'as file type:', selectedFileType);
            // TODO: Implement actual send functionality
            setPhoto(null);
            setSelectedFolder(null);
            setSelectedFileType(null);
        }
    };

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return <Text>Ei ole kaamera õigusi</Text>;
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.fullScreenPreview} />
                <View style={styles.previewActions}>
                    {showFolders ? (
                        <View style={styles.folderList}>
                            {MOCK_FOLDERS.map((folder) => (
                                <TouchableOpacity
                                    key={folder.id}
                                    style={styles.folderOption}
                                    onPress={() => handleFolderSelect(folder.name)}
                                >
                                    <Text style={styles.buttonText}>{folder.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : showFileTypes ? (
                        <View style={styles.fileTypeContainer}>
                            <Text style={styles.FileChooseText}>Choose File</Text>
                            {MOCK_FILE_TYPES.map((fileType) => (
                                <TouchableOpacity
                                    key={fileType.id}
                                    style={styles.fileTypeOption}
                                    onPress={() => handleFileTypeSelect(fileType.name)}
                                >
                                    <Text style={styles.buttonText}>{fileType.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <View style={styles.bottomButtons}>
                                <TouchableOpacity 
                                    style={styles.backButton}
                                    onPress={handleBackToFolders}
                                >
                                    <Text style={styles.buttonText}>back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.sendButton}
                                    onPress={handleSend}
                                    disabled={true}
                                >
                                    <Text style={styles.buttonText}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={styles.folderButton}
                                onPress={handleChooseFolder}
                            >
                                <Text style={styles.buttonText}>
                                    {selectedFolder ? `${selectedFolder} - ${selectedFileType || 'Choose File Type'}` : 'Choose Folder'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.bottomButtons}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.actionButton, 
                                        (selectedFolder && selectedFileType) ? styles.sendButtonEnabled : styles.sendButtonDisabled
                                    ]}
                                    onPress={handleSend}
                                    disabled={!(selectedFolder && selectedFileType)}
                                >
                                    <Text style={styles.buttonText}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.preview} 
                facing={facing}
                ref={cameraRef}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        onPress={takePicture} 
                        style={styles.capture}
                    >
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        backgroundColor: '#00BB8E',
        width: '100%',
        height: '17%',
    },
    capture: {
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 15,
        paddingHorizontal: 20,
        margin: 20,
        height: 70,
        width: 70,
        borderColor: 'black',
        borderWidth: 4,
    },
    fullScreenPreview: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    previewActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#005A2C',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    folderButton: {
        backgroundColor: '#1B4332',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: '#1B4332',
    },
    sendButtonEnabled: {
        backgroundColor: '#1B4332',
    },
    sendButtonDisabled: {
        backgroundColor: '#95A5A6',
    },
    folderList: {
        backgroundColor: '#E8F5E9',
        borderRadius: 30,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    folderOption: {
        backgroundColor: '#1B4332',
        padding: 15,
        borderRadius: 25,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    fileTypeContainer: {
        backgroundColor: '#E8F5E9',
        borderRadius: 30,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    fileTypeOption: {
        backgroundColor: '#1B4332',
        padding: 15,
        borderRadius: 25,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    backButton: {
        flex: 1,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: '#1B4332',
    },
    sendButton: {
        flex: 1,
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: '#95A5A6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    FileChooseText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 10,
        alignSelf: 'center',
    }
});