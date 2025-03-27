import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

export default function FilesScreen() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
   }

const FileItem = ({ name, size, type }: FileProps) => (
 <TouchableOpacity style={styles.fileItem}>
   <Ionicons name="document" size={50} color="#666" />
   <Text style={styles.fileName}>{name}</Text>
   <Text style={styles.fileSize}>{size}</Text>
 </TouchableOpacity>
);

const styles = StyleSheet.create({
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    }
});


