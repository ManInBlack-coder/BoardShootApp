import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import axiosInstance from '../../config/axios';

interface FileProps {
    id: number;
    title: string;
    created_at: string;
    type: string;
    size: string;
}

// Tüüp navigeerimisparameetritele
type FilesScreenRouteProp = RouteProp<{
    Files: {
        folderId: number;
        folderName: string;
    }
}, 'Files'>;

const FileItem = ({ title, size, type }: FileProps) => (
    <TouchableOpacity style={styles.fileItem}>
        <Ionicons 
            name={
                type === "pdf" ? "document-text" :
                type === "docx" ? "document-text" :
                type === "xlsx" ? "document" :
                type === "pptx" ? "document" :
                "document"
            } 
            size={40} 
            color="#666" 
        />
        <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{title}</Text>
            <Text style={styles.fileSize}>{size}</Text>
        </View>
    </TouchableOpacity>
);

export default function FilesScreen() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [files, setFiles] = useState<FileProps[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const route = useRoute<FilesScreenRouteProp>();
    const navigation = useNavigation();
    
    const { folderId, folderName } = route.params;
    
    useEffect(() => {
        fetchFiles();
    }, [folderId]);

    const fetchFiles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(`/api/folders/${folderId}/notes`);
            console.log('Server response (notes):', response.data);
            
            // Failide andmete formaatimine
            const formattedFiles = response.data.map((note: any) => ({
                id: note.id,
                title: note.title || 'Untitled',
                created_at: new Date().toISOString().split('T')[0], // Võib olla vaja serveri vastusest võtta
                type: 'txt', // Vaikimisi tüüp
                size: `${note.texts?.length || 0} KB` // Lihtne suurus tekstide arvu järgi
            }));
            
            setFiles(formattedFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Ei saanud faile laadida. Palun proovige hiljem uuesti.');
            Alert.alert('Viga', 'Ei saanud faile laadida. Palun proovige hiljem uuesti.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };
    
    const filteredFiles = files.filter(file => {
        return file.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleAddFile = () => {
        setIsModalVisible(true);
    };

    const createNewFile = async () => {
        if (!newFileName.trim()) return;

        try {
            // Loome märkuse
            const response = await axiosInstance.post(`/api/folders/${folderId}/notes`, {
                title: newFileName,
                text: newFileContent
            });
            
            console.log('Created note:', response.data);
            
            setNewFileName('');
            setNewFileContent('');
            setIsModalVisible(false);
            fetchFiles(); // Värskendame failide nimekirja
        } catch (error) {
            console.error('Error creating file:', error);
            Alert.alert('Viga', 'Ei saanud faili luua. Palun proovige hiljem uuesti.');
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{folderName}</Text>
                    <TouchableOpacity onPress={handleAddFile} style={styles.addButton}>
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                </View>
                
                {isSearchVisible && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Otsi faile..."
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
                    <TouchableOpacity style={styles.retryButton} onPress={fetchFiles}>
                        <Text style={styles.retryButtonText}>Proovi uuesti</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.filesContainer}>
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <FileItem key={file.id} {...file} />
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Selles kaustas pole veel faile</Text>
                                <TouchableOpacity 
                                    style={styles.createFirstButton}
                                    onPress={handleAddFile}
                                >
                                    <Text style={styles.createFirstButtonText}>Lisa esimene fail</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
                        <Text style={styles.modalTitle}>Create New File</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter file name"
                            value={newFileName}
                            onChangeText={setNewFileName}
                        />
                        <TextInput
                            style={[styles.modalInput, styles.contentInput]}
                            placeholder="Enter file content"
                            value={newFileContent}
                            onChangeText={setNewFileContent}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    setNewFileName('');
                                    setNewFileContent('');
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.createButton]}
                                onPress={createNewFile}
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
    backButton: {
        padding: 4,
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
    filesContainer: {
        padding: 16,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 8,
    },
    fileInfo: {
        marginLeft: 10,
    },
    fileName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    fileSize: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    createFirstButton: {
        backgroundColor: '#005A2C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    createFirstButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
        width: '90%',
        maxHeight: '80%',
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
    contentInput: {
        height: 200,
        textAlignVertical: 'top',
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
