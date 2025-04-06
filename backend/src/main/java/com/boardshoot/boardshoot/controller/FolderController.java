package com.boardshoot.boardshoot.controller;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.service.FolderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class FolderController {
    
    private static final Logger logger = LoggerFactory.getLogger(FolderController.class);
    
    @Autowired
    private FolderService folderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/folders")
    public ResponseEntity<List<Folder>> getAllFolders() {
        try {
            logger.info("Getting all folders for current user");
            List<Folder> folders = folderService.getCurrentUserFolders();
            logger.info("Retrieved {} folders", folders.size());
            return new ResponseEntity<>(folders, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving folders", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/folders/test")
    public ResponseEntity<String> testEndpoint() {
        logger.info("Test endpoint called");
        return new ResponseEntity<>("Folders API is working", HttpStatus.OK);
    }
    
    @PostMapping("/folders")
    public ResponseEntity<Folder> createFolder(@RequestBody Map<String, String> payload) {
        try {
            logger.info("Creating folder with name: {}", payload.get("name"));
            Folder folder = folderService.createFolder(payload.get("name"));
            logger.info("Created folder with ID: {}", folder.getId());
            return new ResponseEntity<>(folder, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating folder", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Uus lõpp-punkt kausta loomiseks konkreetsele kasutajale - testimiseks
    @PostMapping("/folders/user/{userId}")
    public ResponseEntity<Folder> createFolderWithUserId(@RequestBody Map<String, String> payload, @PathVariable Long userId) {
        try {
            logger.info("Creating folder with name: {} for user ID: {}", payload.get("name"), userId);
            Folder folder = folderService.createFolderWithUserId(payload.get("name"), userId);
            logger.info("Created folder with ID: {} for user ID: {}", folder.getId(), userId);
            return new ResponseEntity<>(folder, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating folder for user ID: {}", userId, e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Uus lõpp-punkt kaustade saamiseks konkreetse kasutaja ID järgi - testimiseks
    @GetMapping("/folders/user/{userId}")
    public ResponseEntity<List<Folder>> getFoldersByUserId(@PathVariable Long userId) {
        try {
            logger.info("Getting all folders for user ID: {}", userId);
            List<Folder> folders = folderService.getUserFolders(userId);
            logger.info("Retrieved {} folders for user ID: {}", folders.size(), userId);
            return new ResponseEntity<>(folders, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving folders for user ID: {}", userId, e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 