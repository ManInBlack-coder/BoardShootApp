import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { folderService, noteService } from '../../services/noteService';
import { useFocusEffect } from '@react-navigation/native';

interface PhotoType {
    uri: string;
}

interface Folder {
    id: number;
    name: string;
}

interface Note {
    id: number;
    title: string;
}

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = React.useState<CameraType>('back');
    const [photo, setPhoto] = React.useState<string | null>(null);
    const [showFolders, setShowFolders] = useState(false);
    const [showFileTypes, setShowFileTypes] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const [networkAvailable, setNetworkAvailable] = useState<boolean>(true);
    const [retryCount, setRetryCount] = useState<number>(0);
    const MAX_RETRIES = 3;
    
    // Suumimisega seotud oleku väärtused
    const [zoom, setZoom] = useState(0);
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

    // Funktsioon kaustade laadimiseks - tuleb deklareerida enne kasutamist
    const loadFolders = useCallback(async () => {
        if (!networkAvailable) {
            console.log('Network unavailable, skipping folder loading');
            Alert.alert(
                'Võrguühendus puudub',
                'Ei saa kaustasid laadida. Palun kontrolli oma internetiühendust.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            console.log('Loading folders...');
            setLoading(true);
            const fetchedFolders = await folderService.getFolders();
            console.log('Fetched folders:', fetchedFolders.length);
            setFolders(fetchedFolders);
            
            // Lähtestame retryCount, kui õnnestus
            setRetryCount(0);
            
            // Kui kaustu ei leitud, näitame kasutajale hoiatust
            if (fetchedFolders.length === 0) {
                Alert.alert(
                    'Tähelepanu',
                    'Sul pole ühtegi kausta. Palun loo esmalt kaust.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error loading folders:', error);
            
            // Suurendame retry arvu
            const newRetryCount = retryCount + 1;
            setRetryCount(newRetryCount);
            
            // Kui oleme proovitud maksimaalse arvu kordi, näitame veateadet
            if (newRetryCount >= MAX_RETRIES) {
                let errorMessage = 'Kaustade laadimine ebaõnnestus';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                
                Alert.alert(
                    'Viga',
                    `${errorMessage}. Palun proovi hiljem uuesti.`,
                    [
                        { 
                            text: 'Proovi uuesti', 
                            onPress: () => {
                                setRetryCount(0); // Lähtestame loendurid
                                loadFolders();
                            }
                        }
                    ]
                );
            } else {
                // Proovime automaatselt uuesti laadida väikese viivitusega
                setTimeout(() => {
                    console.log(`Auto-retry ${newRetryCount} of ${MAX_RETRIES}`);
                    loadFolders();
                }, 1000 * newRetryCount); // Suurenev viivitus: 1s, 2s, 3s...
            }
        } finally {
            setLoading(false);
        }
    }, [networkAvailable, retryCount]);
    
    // Funktsioon märkmete laadimiseks valitud kaustast
    const loadNotes = useCallback(async (folderId: number) => {
        if (!networkAvailable) {
            console.log('Network unavailable, skipping notes loading');
            Alert.alert(
                'Võrguühendus puudub',
                'Ei saa märkmeid laadida. Palun kontrolli oma internetiühendust.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            console.log('Loading notes for folder:', folderId);
            setLoading(true);
            // Kasutame folderService.getNotesForFolder (mitte noteService)
            const fetchedNotes = await folderService.getNotesForFolder(folderId);
            console.log('Fetched notes:', fetchedNotes.length);
            setNotes(fetchedNotes);
            
            // Kui märkmeid ei leitud, näitame kasutajale hoiatust
            if (fetchedNotes.length === 0) {
                Alert.alert(
                    'Tähelepanu',
                    'Selles kaustas pole märkmeid. Palun loo esmalt märge.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            let errorMessage = 'Märkmete laadimine ebaõnnestus';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            Alert.alert(
                'Viga',
                `${errorMessage}. Palun kontrolli võrguühendust.`,
                [
                    { 
                        text: 'Proovi uuesti', 
                        onPress: () => loadNotes(folderId)
                    },
                    {
                        text: 'Tagasi',
                        onPress: () => setShowFileTypes(false),
                        style: 'cancel'
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    }, [networkAvailable]);

    // Jälgime võrguühenduse seisundit - NetInfo asemel kasutame lihtsamat lahendust
    useEffect(() => {
        // Algne võrguühenduse kontroll
        const checkInitialConnection = async () => {
            try {
                // Proovime teha lihtsa fetch päringu, et kontrollida võrguühendust
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 5000);
                });
                
                const fetchPromise = fetch('https://www.google.com', { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                
                await Promise.race([fetchPromise, timeoutPromise]);
                console.log('Initial network check: available');
                setNetworkAvailable(true);
            } catch (error) {
                console.error('Initial network check failed:', error);
                setNetworkAvailable(false);
            }
        };
        
        checkInitialConnection();
        
        // Perioodiline võrguühenduse kontrollimine
        const networkCheckInterval = setInterval(async () => {
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 5000);
                });
                
                const fetchPromise = fetch('https://www.google.com', { 
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                
                await Promise.race([fetchPromise, timeoutPromise]);
                
                // Kui võrguühendus taastub
                if (!networkAvailable) {
                    console.log('Network restored, reloading data...');
                    setNetworkAvailable(true);
                    loadFolders();
                    setRetryCount(0);
                }
            } catch (error) {
                if (networkAvailable) {
                    console.log('Network connection lost');
                    setNetworkAvailable(false);
                }
            }
        }, 10000); // Kontrollime iga 10 sekundi järel
        
        // Puhastame intervalli, kui komponent eemaldatakse
        return () => {
            clearInterval(networkCheckInterval);
        };
    }, [networkAvailable, loadFolders, retryCount]);

    // Laadime kaustad kui rakendus käivitub
    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    // Laadime kaustad uuesti, kui ekraan saab fookuse
    useFocusEffect(
        useCallback(() => {
            console.log('Camera screen focused, loading folders...');
            loadFolders();
            return () => {
                // Puhastustoimingud, kui ekraan kaotab fookuse
                console.log('Camera screen unfocused');
            };
        }, [loadFolders])
    );

    // Kui pilt on tehtud, laeme kaustad uuesti, et tagada värske info
    useEffect(() => {
        if (photo) {
            loadFolders();
        }
    }, [photo, loadFolders]);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                // Võtame pildi madalama kvaliteediga, et vähendada faili suurust
                const result = await cameraRef.current.takePictureAsync({
                    quality: 0.5, // Vähendame kvaliteeti, et vähendada faili suurust
                    base64: false, // Me teisendame ise hiljem
                    skipProcessing: false, // Lubame töödelda pilti
                });
                const photoData = result as PhotoType;
                setPhoto(photoData.uri);
                console.log('Photo taken:', photoData.uri);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Viga', 'Pildi tegemine ebaõnnestus');
            }
        }
    };

    const handleCancel = () => {
        setPhoto(null);
        setSelectedFolder(null);
        setSelectedNote(null);
        setShowFileTypes(false);
    };

    const handleChooseFolder = () => {
        // Laadime kaustad uuesti, et tagada värske info
        loadFolders();
        setShowFolders(true);
        setShowFileTypes(false);
    };

    const handleFolderSelect = async (folder: Folder) => {
        setSelectedFolder(folder);
        setShowFolders(false);
        // Laadime valitud kaustast märkmed
        await loadNotes(folder.id);
        setShowFileTypes(true);
    };

    const handleNoteSelect = (note: Note) => {
        setSelectedNote(note);
        setShowFileTypes(false);
    };

    const handleBackToFolders = () => {
        setShowFileTypes(false);
        setShowFolders(true);
        setSelectedNote(null);
    };

    const handleSend = async () => {
        if (!networkAvailable) {
            Alert.alert(
                'Võrguühendus puudub',
                'Ei saa pilti üles laadida. Palun kontrolli oma internetiühendust.',
                [{ text: 'OK' }]
            );
            return;
        }

        if (selectedFolder && photo && selectedNote) {
            try {
                setLoading(true);
                console.log('Sending photo to server:', photo, 'to folder:', selectedFolder.name, 'as note:', selectedNote.title);
                
                // Saadame pildi API kaudu serverisse
                await noteService.addImageToNote(selectedFolder.id, selectedNote.id, photo);
                
                // Kui õnnestub, siis puhastame oleku
                setPhoto(null);
                setSelectedFolder(null);
                setSelectedNote(null);
                
                Alert.alert('Õnnestus', 'Pilt edukalt lisatud märkmesse');
            } catch (error) {
                console.error('Error sending photo:', error);
                
                // Näitame kasutajale täpsemat veateadet
                let errorMessage = 'Pildi lisamine ebaõnnestus';
                if (error instanceof Error) {
                    errorMessage = `Viga: ${error.message}`;
                }
                
                Alert.alert('Viga', errorMessage, [
                    { 
                        text: 'Proovi uuesti', 
                        onPress: () => {
                            // Kui kasutaja soovib uuesti proovida, laadime kaustad uuesti
                            loadFolders();
                        }
                    },
                    {
                        text: 'Tühista',
                        onPress: handleCancel,
                        style: 'cancel'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        }
    };

    // Suumimisfunktsioonid
    const handleTouchStart = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setTouchStart({ x: pageX, y: pageY });
    };
    
    const handleTouchMove = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        setTouchEnd({ x: pageX, y: pageY });
        
        // Arvutame suurenduse/vähenduse
        const screenHeight = Dimensions.get('window').height;
        
        // Vertikaalne liikumine mõjutab suumi
        const moveY = touchStart.y - pageY;
        
        // Vähendame tundlikkust, määrates väiksema kordaja
        // Varasemalt kasutasime otsest protsentuaalset muutust, nüüd muudame seda aeglasemaks
        const sensitivity = 0.15; // Vähendame tundlikkust (väärtus 0-1 vahel, madalam = aeglasem)
        const zoomChange = (moveY / screenHeight) * sensitivity;
        
        // Uuendame suumi väärtust, piirame 0-1 vahele
        let newZoom = zoom + zoomChange;
        newZoom = Math.min(Math.max(newZoom, 0), 1);
        
        // Kui muutus on väike, siis ignoreerime seda, et vältida värisemist
        if (Math.abs(newZoom - zoom) > 0.001) {
            setZoom(newZoom);
        }
    };
    
    const handleTouchEnd = () => {
        // Lähtestame puutepunktid
        setTouchStart({ x: 0, y: 0 });
        setTouchEnd({ x: 0, y: 0 });
    };

    const formatZoom = () => {
        // Arvutame suumi väärtuse näitamiseks (1.0x - 10.0x)
        return `${(1 + zoom * 9).toFixed(1)}x`;
    };

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return <Text>Ei ole kaamera õigusi</Text>;
    }

    // Kui laeb, siis näitame laadimisanimatsiooni
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00BB8E" />
                <Text style={styles.loadingText}>Palun oodake...</Text>
            </View>
        );
    }

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photo }} style={styles.fullScreenPreview} />
                <View style={styles.previewActions}>
                    {showFolders ? (
                        <View style={styles.folderList}>
                            {folders.length === 0 ? (
                                <View>
                                    <Text style={styles.emptyText}>Kaustu pole veel loodud</Text>
                                    <TouchableOpacity
                                        style={styles.backToPhotoButton}
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.buttonText}>Tagasi</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={loadFolders}
                                    >
                                        <Text style={styles.buttonText}>Proovi uuesti</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                folders.map((folder) => (
                                    <TouchableOpacity
                                        key={folder.id}
                                        style={styles.folderOption}
                                        onPress={() => handleFolderSelect(folder)}
                                    >
                                        <Text style={styles.buttonText}>{folder.name}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    ) : showFileTypes ? (
                        <View style={styles.fileTypeContainer}>
                            <Text style={styles.FileChooseText}>Vali märge</Text>
                            {notes.length === 0 ? (
                                <View>
                                    <Text style={styles.emptyText}>Sellel kaustal pole veel märkmeid</Text>
                                    <TouchableOpacity 
                                        style={styles.backButton}
                                        onPress={handleBackToFolders}
                                    >
                                        <Text style={styles.buttonText}>Tagasi kaustade juurde</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.cancelButton}
                                        onPress={handleCancel}
                                    >
                                        <Text style={styles.buttonText}>Tühista</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                notes.map((note) => (
                                    <TouchableOpacity
                                        key={note.id}
                                        style={styles.fileTypeOption}
                                        onPress={() => handleNoteSelect(note)}
                                    >
                                        <Text style={styles.buttonText}>{note.title}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                            <View style={styles.bottomButtons}>
                                <TouchableOpacity 
                                    style={styles.backButton}
                                    onPress={handleBackToFolders}
                                >
                                    <Text style={styles.buttonText}>Tagasi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.sendButton}
                                    onPress={handleSend}
                                    disabled={true}
                                >
                                    <Text style={styles.buttonText}>Saada</Text>
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
                                    {selectedFolder ? `${selectedFolder.name} - ${selectedNote ? selectedNote.title : 'Vali märge'}` : 'Vali kaust'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.bottomButtons}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.buttonText}>Tühista</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.actionButton, 
                                        (selectedFolder && selectedNote) ? styles.sendButtonEnabled : styles.sendButtonDisabled
                                    ]}
                                    onPress={handleSend}
                                    disabled={!(selectedFolder && selectedNote)}
                                >
                                    <Text style={styles.buttonText}>Saada</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View 
            style={styles.container}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <CameraView 
                style={styles.preview} 
                facing={facing}
                ref={cameraRef}
                zoom={zoom}
            >
                <View style={styles.buttonContainer}>
                    <View style={styles.captureWrapper}>
                        <TouchableOpacity 
                            onPress={takePicture} 
                            style={styles.capture}
                        >
                        </TouchableOpacity>
                    </View>
                    <View style={styles.zoomIndicator}>
                        <Text style={styles.zoomText}>{formatZoom()}</Text>
                    </View>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        height: '20%',
        paddingHorizontal: 20,
    },
    captureWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    capture: {
        borderRadius: 50,
        padding: 15,
        paddingHorizontal: 20,
        height: 80,
        width: 80,
        borderColor: '#FFFFFF',
        borderWidth: 6,
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    emptyText: {
        color: '#555',
        textAlign: 'center',
        padding: 15,
        fontSize: 16,
    },
    backToPhotoButton: {
        backgroundColor: '#E53935',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    retryButton: {
        backgroundColor: '#1B4332',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cancelButton: {
        backgroundColor: '#E53935',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    zoomIndicator: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1,
        marginRight: 25,
    },
    zoomText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});