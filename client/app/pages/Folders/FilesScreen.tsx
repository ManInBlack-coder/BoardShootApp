import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

interface FileProps {
    name: string;
    size: string;
    type: string;
}

// Tüüp navigeerimisparameetritele
type FilesScreenRouteProp = RouteProp<{
    Files: {
        folderName: string;
        files: FileProps[];
    }
}, 'Files'>;

const FileItem = ({ name, size, type }: FileProps) => (
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
     <Text style={styles.fileName}>{name}</Text>
     <Text style={styles.fileSize}>{size}</Text>
   </View>
 </TouchableOpacity>
);

export default function FilesScreen() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const route = useRoute<FilesScreenRouteProp>();
    const navigation = useNavigation();
    
    const { folderName, files } = route.params;
    
    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };
    
    const filteredFiles = files.filter(file => {
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.title}>{folderName}</Text>
                    <TouchableOpacity onPress={toggleSearch} style={styles.searchIcon}>
                        <Ionicons name="search" size={28} color="white" />
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

            <ScrollView style={styles.scrollView}>
                <View style={styles.filesContainer}>
                    {filteredFiles.map((file, index) => (
                        <FileItem key={index} {...file} />
                    ))}
                </View>
            </ScrollView>
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
    }
});
