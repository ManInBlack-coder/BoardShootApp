package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.FolderRepository;
import com.boardshoot.boardshoot.repository.NoteRepository;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class NoteService {
    
    private static final Logger logger = LoggerFactory.getLogger(NoteService.class);
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StorageService storageService;
    
    // Testimisloogika - kasutame fikseeritud kasutaja ID-d
    private static final Long TEST_USER_ID = 1L;
    
    public List<Note> getNotesForFolder(Long folderId) {
        try {
            logger.info("Fetching notes for folder {}", folderId);
            // Kontrollime, kas kaust on olemas ja kuulub kasutajale
            Optional<Folder> folderOpt = folderRepository.findById(folderId);
            if (!folderOpt.isPresent()) {
                logger.error("Folder not found: {}", folderId);
                throw new RuntimeException("Folder not found");
            }
            
            // Testimiseks kasutame otseteed
            return noteRepository.findByFolderId(folderId);
        } catch (Exception e) {
            logger.error("Error in getNotesForFolder", e);
            throw e;
        }
    }
    
    public Note createNote(Long folderId, String title, String text) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Creating note with title {} for folder {} and user {}", title, folderId, userId);
            
            // Leiame kausta
            Optional<Folder> folderOpt = folderRepository.findById(folderId);
            if (!folderOpt.isPresent()) {
                logger.error("Folder not found: {}", folderId);
                throw new RuntimeException("Folder not found");
            }
            Folder folder = folderOpt.get();
            
            // Leiame kasutaja
            Optional<User> userOpt = userRepository.findById(userId);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                logger.info("Found existing user: {}", user.getUsername());
            } else {
                // Kui kasutajat pole, siis viskame erindi
                logger.error("User not found with ID: {}", userId);
                throw new RuntimeException("User not found");
            }
            
            // Loome märkuse
            Note note = new Note();
            note.setTitle(title);
            note.setFolder(folder);
            note.setUser(user);
            
            // Lisame teksti (kui on olemas)
            if (text != null && !text.isEmpty()) {
                note.addText(text);
            }
            
            note = noteRepository.save(note);
            logger.info("Created note with ID: {}", note.getId());
            
            return note;
        } catch (Exception e) {
            logger.error("Error in createNote", e);
            throw e;
        }
    }
    
    public Note getNote(Long noteId) {
        try {
            logger.info("Fetching note with ID {}", noteId);
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            return noteOpt.get();
        } catch (Exception e) {
            logger.error("Error in getNote", e);
            throw e;
        }
    }
    
    /**
     * Uuendab olemasoleva märkme sisu.
     * @param noteId Märkme ID, mida uuendatakse
     * @param title Uus pealkiri (võib olla null, kui ei muudeta)
     * @param text Uus tekstisisu (võib olla null, kui ei muudeta)
     * @return Uuendatud märge
     */
    public Note updateNote(Long noteId, String title, String text) {
        try {
            logger.info("Updating note with ID {}", noteId);
            
            // Kontrolli, kas kasutajal on õigus märkust muuta
            Long userId = getCurrentUserId();
            
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            
            Note note = noteOpt.get();
            
            // Kontrollime, kas märkus kuulub kasutajale (praegusel juhul ei rakenda, aga turvalisuse jaoks võiks)
            // if (!note.getUser().getId().equals(userId)) {
            //     logger.error("User {} not authorized to update note {}", userId, noteId);
            //     throw new RuntimeException("Not authorized to update this note");
            // }
            
            // Uuendame pealkirja, kui see on määratud
            if (title != null && !title.isEmpty()) {
                note.setTitle(title);
            }
            
            // Asendame olemasoleva teksti, kui uus tekst on olemas
            if (text != null) {
                // Kuna Note klassis on tekstid loeteluna, siis asendame kõik varasemad tekstid ühe uuega
                note.setTexts(new ArrayList<>());
                note.addText(text);
            }
            
            note = noteRepository.save(note);
            logger.info("Updated note with ID: {}", note.getId());
            
            return note;
        } catch (Exception e) {
            logger.error("Error in updateNote", e);
            throw e;
        }
    }
    
    /**
     * Kustutab märkme antud ID põhjal.
     * @param noteId Märkme ID, mida soovitakse kustutada
     * @return true, kui kustutamine õnnestus
     */
    public boolean deleteNote(Long noteId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Deleting note with ID {} for user {}", noteId, userId);
            
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            
            Note note = noteOpt.get();
            
            // Võib lisada kontrolli, kas märkus kuulub kasutajale
            // if (!note.getUser().getId().equals(userId)) {
            //     logger.error("User {} not authorized to delete note {}", userId, noteId);
            //     throw new RuntimeException("Not authorized to delete this note");
            // }
            
            noteRepository.delete(note);
            logger.info("Successfully deleted note with ID: {}", noteId);
            
            return true;
        } catch (Exception e) {
            logger.error("Error in deleteNote for noteId: {}", noteId, e);
            throw e;
        }
    }
    
    /**
     * Meetod praeguse autenditud kasutaja ID saamiseks.
     * Kui kasutaja on autenditud, tagastab kasutaja ID.
     * Kui autentimine puudub, tagastab testimiseks TEST_USER_ID.
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            logger.warn("Authentication is null, using test user ID: {}", TEST_USER_ID);
            return TEST_USER_ID;
        }
        
        logger.info("Authentication: name={}, principal={}, isAuthenticated={}", 
                  authentication.getName(), 
                  authentication.getPrincipal().getClass().getName(),
                  authentication.isAuthenticated());
        
        if (authentication.isAuthenticated()) {
            if (authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                logger.info("Found authenticated user: {} with ID: {}", userDetails.getUsername(), userDetails.getId());
                return userDetails.getId();
            } else {
                logger.warn("Principal is not UserDetailsImpl but {}", authentication.getPrincipal().getClass().getName());
                
                // Proovime leida kasutaja username järgi
                String username = authentication.getName();
                logger.info("Looking up user by username: {}", username);
                
                if (!"anonymousUser".equals(username)) {
                    Optional<User> userOpt = userRepository.findByUsername(username);
                    if (userOpt.isPresent()) {
                        logger.info("Found user by username: {} with ID: {}", username, userOpt.get().getId());
                        return userOpt.get().getId();
                    }
                }
            }
        }
        
        // Kui autentimine puudub, kasutame testimiseks TEST_USER_ID
        logger.warn("No authenticated user found, using test user ID: {}", TEST_USER_ID);
        return TEST_USER_ID;
    }
    
    /**
     * Lisab olemasolevale märkmele pildi.
     * @param noteId Märkme ID, millele pilt lisatakse
     * @param imageData Pildi andmed baitmaatriksina
     * @return Uuendatud märge
     */
    public Note addImageToNote(Long noteId, byte[] imageData) {
        try {
            logger.info("Adding image to note with ID {}", noteId);
            
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            
            Note note = noteOpt.get();
            
            // Laadime pildi Supabase Storage'isse ja saame tagasi URL-i
            String imageUrl = storageService.uploadImage(imageData, noteId);
            logger.info("Image uploaded to storage, URL: {}", imageUrl);
            
            // Lisame pildi URL-i märkmele
            note.addImageUrl(imageUrl);
            
            note = noteRepository.save(note);
            logger.info("Added image to note with ID: {}", note.getId());
            
            return note;
        } catch (Exception e) {
            logger.error("Error in addImageToNote", e);
            throw e;
        }
    }
    
    /**
     * Abimeetod, mis lühendab pikki URL-ide logimiseks
     */
    private String truncateUrl(String url) {
        if (url == null || url.length() <= 50) {
            return url;
        }
        
        if (url.startsWith("data:image")) {
            String prefix = "data:image/";
            int endOfMimeType = url.indexOf(";base64,");
            if (endOfMimeType > 0) {
                String mimeType = url.substring(prefix.length(), endOfMimeType);
                return String.format("data:image/%s;base64,...[%d chars]", mimeType, url.length() - endOfMimeType - 8);
            }
        }
        
        return String.format("%s...%s [%d chars]", 
                url.substring(0, 20), 
                url.substring(url.length() - 20), 
                url.length());
    }
    
    /**
     * Kustutab pildi märkmest URL-i põhjal
     * @param noteId Märkme ID
     * @param imageUrl Pildi URL, mida soovitakse kustutada
     * @return true, kui kustutamine õnnestus
     */
    public boolean deleteImageFromNote(Long noteId, String imageUrl) {
        try {
            logger.info("Deleting image from note {}", noteId);
            logger.debug("Image URL to delete: {}", truncateUrl(imageUrl));
            
            // Leiame märkme
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            
            Note note = noteOpt.get();
            
            // Kontrollime, kas pilt on märkme piltide nimekirjas
            List<String> imageUrls = note.getImageUrls();
            if (imageUrls == null || !imageUrls.contains(imageUrl)) {
                logger.error("Image URL not found in note: {}", noteId);
                return false;
            }
            
            // Kui tegemist on base64 pildiga, siis lihtsalt eemaldame selle märkme piltide nimekirjast
            // Kui tegemist on Supabase Storage pildiga, siis kustutame selle ka Supabase'ist
            if (imageUrl.startsWith("http") && storageService != null) {
                try {
                    // Võtame pildi nime URL-ist
                    String imageName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                    // Kustutame pildi Supabase'ist
                    storageService.deleteImage(imageName);
                    logger.info("Deleted image from storage: {}", imageName);
                } catch (Exception e) {
                    logger.error("Failed to delete image from storage: {}", e.getMessage(), e);
                    // Jätkame siiski, et eemaldada pilt märkmest
                }
            }
            
            // Eemaldame pildi märkme piltide nimekirjast
            imageUrls.remove(imageUrl);
            
            // Salvestame muudetud märkme
            note = noteRepository.save(note);
            logger.info("Image successfully deleted from note {}", noteId);
            
            return true;
        } catch (Exception e) {
            logger.error("Error deleting image from note: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Muudab piltide järjekorda märkmes
     * @param noteId Märkme ID
     * @param newImageOrder Uus piltide järjekord (URL-ide nimekiri)
     * @return Uuendatud märge
     */
    public Note reorderImages(Long noteId, List<String> newImageOrder) {
        try {
            logger.info("Reordering {} images for note {}", 
                    newImageOrder != null ? newImageOrder.size() : 0, 
                    noteId);
            
            // Leiame märkme
            Optional<Note> noteOpt = noteRepository.findById(noteId);
            if (!noteOpt.isPresent()) {
                logger.error("Note not found: {}", noteId);
                throw new RuntimeException("Note not found");
            }
            
            Note note = noteOpt.get();
            
            // Kontrollime, et uues järjekorras oleks kõik märkme pildid
            List<String> currentImageUrls = note.getImageUrls();
            if (currentImageUrls == null || currentImageUrls.size() != newImageOrder.size()) {
                logger.error("New image order does not match current images count. Current: {}, New: {}", 
                        currentImageUrls != null ? currentImageUrls.size() : 0, 
                        newImageOrder.size());
                throw new RuntimeException("Invalid image order list");
            }
            
            // Kontrollime, et kõik pildid oleksid olemas
            for (String imageUrl : currentImageUrls) {
                if (!newImageOrder.contains(imageUrl)) {
                    logger.error("Image URL not found in new order: {}", truncateUrl(imageUrl));
                    throw new RuntimeException("Invalid image order: missing images");
                }
            }
            
            // Seame uue järjekorra
            note.setImageUrls(newImageOrder);
            
            // Salvestame muudetud märkme
            note = noteRepository.save(note);
            logger.info("Images successfully reordered for note {}", noteId);
            
            return note;
        } catch (Exception e) {
            logger.error("Error reordering images: {}", e.getMessage(), e);
            throw e;
        }
    }
} 