package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.Base64;

@RestController
@RequestMapping("/api/folders/{folderId}/notes")
@CrossOrigin(origins = "*")
public class NoteController {
    
    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);
    
    @Autowired
    private NoteService noteService;
    
    @GetMapping
    public ResponseEntity<List<Note>> getNotes(@PathVariable Long folderId) {
        try {
            logger.info("Getting notes for folder: {}", folderId);
            List<Note> notes = noteService.getNotesForFolder(folderId);
            logger.info("Retrieved {} notes", notes.size());
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            logger.error("Error getting notes for folder: {}", folderId, e);
            throw e;
        }
    }
    
    @PostMapping
    public ResponseEntity<Note> createNote(@PathVariable Long folderId, @RequestBody CreateNoteRequest request) {
        try {
            logger.info("Creating note with title: {} for folder: {}", request.getTitle(), folderId);
            Note note = noteService.createNote(folderId, request.getTitle(), request.getText());
            logger.info("Created note with id: {}", note.getId());
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            logger.error("Error creating note for folder: {}", folderId, e);
            throw e;
        }
    }
    
    @GetMapping("/{noteId}")
    public ResponseEntity<Note> getNote(@PathVariable Long folderId, @PathVariable Long noteId) {
        try {
            logger.info("Getting note: {} from folder: {}", noteId, folderId);
            Note note = noteService.getNote(noteId);
            logger.info("Retrieved note: {}", note.getId());
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            logger.error("Error getting note: {} from folder: {}", noteId, folderId, e);
            throw e;
        }
    }
    
    @PutMapping("/{noteId}")
    public ResponseEntity<Note> updateNote(@PathVariable Long folderId, @PathVariable Long noteId, @RequestBody UpdateNoteRequest request) {
        try {
            logger.info("Updating note: {} in folder: {}", noteId, folderId);
            Note note = noteService.updateNote(noteId, request.getTitle(), request.getText());
            logger.info("Updated note: {}", note.getId());
            return ResponseEntity.ok(note);
        } catch (Exception e) {
            logger.error("Error updating note: {} in folder: {}", noteId, folderId, e);
            throw e;
        }
    }
    
    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long folderId, @PathVariable Long noteId) {
        try {
            logger.info("Deleting note: {} from folder: {}", noteId, folderId);
            boolean result = noteService.deleteNote(noteId);
            logger.info("Note deletion result: {}", result);
            return ResponseEntity.ok(Map.of("success", true, "message", "Note deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting note: {} from folder: {}", noteId, folderId, e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/{noteId}/images")
    public ResponseEntity<?> addImageToNote(@PathVariable Long folderId, 
                                           @PathVariable Long noteId, 
                                           @RequestBody AddImageRequest request) {
        try {
            logger.info("Adding image to note: {} in folder: {}", noteId, folderId);
            
            if (request.getImage() == null || request.getImage().isEmpty()) {
                logger.warn("Image data is empty for note: {} in folder: {}", noteId, folderId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Image is required"));
            }
            
            logger.debug("Received image data length: {} bytes", request.getImage().length());
            
            try {
                // Dekodeerime base64 pildi baitideks
                byte[] imageBytes = Base64.getDecoder().decode(request.getImage());
                logger.debug("Decoded image size: {} bytes", imageBytes.length);
                
                // Lisame pildi märkmesse
                Note updatedNote = noteService.addImageToNote(noteId, imageBytes);
                
                logger.info("Successfully added image to note: {}", noteId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Image added successfully"));
            } catch (IllegalArgumentException e) {
                // See viga võib tekkida, kui base64 kodeering on vigane
                logger.error("Invalid base64 encoding for image on note: {} in folder: {}", noteId, folderId, e);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false, 
                    "message", "Invalid image data format: " + e.getMessage())
                );
            }
        } catch (Exception e) {
            logger.error("Error adding image to note: {} in folder: {}: {}", noteId, folderId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Server error: " + e.getMessage())
            );
        }
    }
    
    /**
     * Kustutab pildi märkmest
     */
    @DeleteMapping("/{noteId}/images")
    public ResponseEntity<?> deleteImageFromNote(@PathVariable Long folderId, 
                                               @PathVariable Long noteId,
                                               @RequestBody DeleteImageRequest request) {
        try {
            logger.info("Deleting image from note: {} in folder: {}", noteId, folderId);
            
            if (request.getImageUrl() == null || request.getImageUrl().isEmpty()) {
                logger.warn("Image URL is empty for note: {} in folder: {}", noteId, folderId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Image URL is required"));
            }
            
            // Kustutame pildi
            boolean success = noteService.deleteImageFromNote(noteId, request.getImageUrl());
            
            if (success) {
                logger.info("Successfully deleted image from note: {}", noteId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Image deleted successfully"));
            } else {
                logger.warn("Failed to delete image from note: {}", noteId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to delete image"));
            }
        } catch (Exception e) {
            logger.error("Error deleting image from note: {} in folder: {}: {}", noteId, folderId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Server error: " + e.getMessage())
            );
        }
    }
    
    /**
     * Muudab piltide järjekorda märkmes
     */
    @PutMapping("/{noteId}/images/reorder")
    public ResponseEntity<?> reorderImages(@PathVariable Long folderId, 
                                         @PathVariable Long noteId,
                                         @RequestBody ReorderImagesRequest request) {
        try {
            logger.info("Reordering images for note: {} in folder: {}", noteId, folderId);
            
            if (request.getImageUrls() == null || request.getImageUrls().isEmpty()) {
                logger.warn("Image URLs list is empty for note: {} in folder: {}", noteId, folderId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Image URLs list is required"));
            }
            
            // Muudame piltide järjekorda
            Note updatedNote = noteService.reorderImages(noteId, request.getImageUrls());
            
            logger.info("Successfully reordered images for note: {}", noteId);
            return ResponseEntity.ok(updatedNote);
        } catch (Exception e) {
            logger.error("Error reordering images for note: {} in folder: {}: {}", noteId, folderId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Server error: " + e.getMessage())
            );
        }
    }
    
    public static class CreateNoteRequest {
        private String title;
        private String text;
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
    }
    
    public static class UpdateNoteRequest {
        private String title;
        private String text;
        
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
    }
    
    public static class AddImageRequest {
        private String image;
        
        public String getImage() {
            return image;
        }
        
        public void setImage(String image) {
            this.image = image;
        }
    }
    
    public static class DeleteImageRequest {
        private String imageUrl;
        
        public String getImageUrl() {
            return imageUrl;
        }
        
        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
    
    public static class ReorderImagesRequest {
        private List<String> imageUrls;
        
        public List<String> getImageUrls() {
            return imageUrls;
        }
        
        public void setImageUrls(List<String> imageUrls) {
            this.imageUrls = imageUrls;
        }
    }
} 