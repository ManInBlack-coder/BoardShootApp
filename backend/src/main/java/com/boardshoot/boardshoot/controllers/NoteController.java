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
} 