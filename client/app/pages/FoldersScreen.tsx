import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";


interface FolderProps {
 name: string;
 count: number;
}


const FolderItem = ({ name, count }: FolderProps) => (
 <TouchableOpacity style={styles.folderItem}>
   <Ionicons name="folder" size={50} color="#666" />
   <Text style={styles.folderName}>{name}</Text>
   <Text style={styles.folderCount}>{count}</Text>
 </TouchableOpacity>
);


export default function FoldersScreen() {
 const [isSearchVisible, setIsSearchVisible] = useState(false);
 const [searchQuery, setSearchQuery] = useState<string>('');


 const toggleSearch = () => {
   setIsSearchVisible(!isSearchVisible);
 };


 const folders = [
   { name: "Mata", count: 120 },
   { name: "Eesti keel", count: 60 },
   { name: "Keemia", count: 70 },
   { name: "Andmeanalüütika", count: 80 },
 ];


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
         <View style={{ width: 28 }} />
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


     <ScrollView style={styles.scrollView}>
       <View style={styles.gridContainer}>
         {filteredFolders.map((folder, index) => (
           <FolderItem key={index} {...folder} />
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
   backgroundColor: '#2e7d32',
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
});





