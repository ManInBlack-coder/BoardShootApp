package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "*")
public class FolderController {
    
    private static final Logger logger = LoggerFactory.getLogger(FolderController.class);
    
    @Autowired
    private FolderService folderService;
    
    @GetMapping
    public ResponseEntity<List<Folder>> getFolders() {
        try {
            logger.info("Getting folders");
            List<Folder> folders = folderService.getCurrentUserFolders();
            logger.info("Retrieved {} folders", folders.size());
            return ResponseEntity.ok(folders);
        } catch (Exception e) {
            logger.error("Error getting folders", e);
            throw e;
        }
    }
    
    @PostMapping
    public ResponseEntity<Folder> createFolder(@RequestBody CreateFolderRequest request) {
        try {
            logger.info("Creating folder with name: {}", request.getName());
            Folder folder = folderService.createFolder(request.getName());
            logger.info("Created folder with id: {}", folder.getId());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            logger.error("Error creating folder", e);
            throw e;
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Test endpoint called");
        return ResponseEntity.ok("Server is running");
    }
    
    public static class CreateFolderRequest {
        private String name;
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
    }
} 