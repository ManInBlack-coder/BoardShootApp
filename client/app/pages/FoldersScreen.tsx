import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useEffect } from 'react';
import FilesScreen from "./FilesScreen";


interface FolderProps {
 name: string;
 count: number; 
 files?: Array<{name: string, size: string, type: string}>;
}


const FolderItem = ({ name, count, files }: FolderProps) => {
 const navigation = useNavigation<NavigationProp<ParamListBase>>();
 
 return (
   <TouchableOpacity 
     style={styles.folderItem} 
     onPress={() => navigation.navigate('Files', { folderName: name, files: files })}
   >
     <Ionicons name="folder" size={50} color="#666" />
     <Text style={styles.folderName}>{name}</Text>
     <Text style={styles.folderCount}>{count}</Text>
   </TouchableOpacity>
 );
};


export default function FoldersScreen() {
 const [isSearchVisible, setIsSearchVisible] = useState(false);
 const [searchQuery, setSearchQuery] = useState<string>('');


 const toggleSearch = () => {
   setIsSearchVisible(!isSearchVisible);
 };


 const folders = [
   { 
     name: "Mata", 
     count: 120, 
     files: [
       { name: "Algebra", size: "2.3 MB", type: "pdf" },
       { name: "Geomeetria", size: "1.8 MB", type: "docx" },
       { name: "Statistika", size: "4.5 MB", type: "xlsx" },
     ] 
   },
   { 
     name: "Eesti keel", 
     count: 60, 
     files: [
       { name: "Grammatika.pdf", size: "3.2 MB", type: "pdf" },
       { name: "Kirjandus.docx", size: "2.1 MB", type: "docx" },
     ] 
   },
   { 
     name: "Keemia", 
     count: 70, 
     files: [
       { name: "Elemendid.pdf", size: "5.7 MB", type: "pdf" },
       { name: "Reaktsioonid.pptx", size: "8.3 MB", type: "pptx" },
       { name: "Praktikum.docx", size: "1.2 MB", type: "docx" },
     ] 
   },
   { 
     name: "Andmeanalüütika", 
     count: 80, 
     files: [
       { name: "Python_alused.pdf", size: "4.2 MB", type: "pdf" },
       { name: "SQL_päringud.pdf", size: "3.1 MB", type: "pdf" },
       { name: "Andmestik.xlsx", size: "9.6 MB", type: "xlsx" },
       { name: "Visualiseerimine.pptx", size: "7.8 MB", type: "pptx" },
     ] 
   },
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





