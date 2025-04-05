package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.FolderRepository;
import com.boardshoot.boardshoot.repository.NoteRepository;
import com.boardshoot.boardshoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {
    
    private static final Logger logger = LoggerFactory.getLogger(NoteService.class);
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
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
            logger.info("Creating note with title {} for folder {}", title, folderId);
            
            // Leiame kausta
            Optional<Folder> folderOpt = folderRepository.findById(folderId);
            if (!folderOpt.isPresent()) {
                logger.error("Folder not found: {}", folderId);
                throw new RuntimeException("Folder not found");
            }
            Folder folder = folderOpt.get();
            
            // Leiame kasutaja (testimiseks kasutame fikseeritud ID-d)
            Optional<User> userOpt = userRepository.findById(TEST_USER_ID);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                logger.info("Found existing user: {}", user.getUsername());
            } else {
                // Kui testi kasutajat pole, loome ajutise
                logger.info("Test user not found, creating a temporary one");
                user = new User();
                user.setId(TEST_USER_ID);
                user.setUsername("testuser");
                user.setEmail("test@example.com");
                user = userRepository.save(user);
                logger.info("Created test user with ID: {}", user.getId());
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
} 