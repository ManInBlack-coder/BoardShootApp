package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.FolderRepository;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class FolderService {
    
    private static final Logger logger = LoggerFactory.getLogger(FolderService.class);
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Testimisloogika - kasutame fikseeritud kasutaja ID-d
    private static final Long TEST_USER_ID = 1L;
    
    public List<Folder> getCurrentUserFolders() {
        try {
            // AJUTINE: Lihtsustatud loogika testimiseks
            logger.info("Fetching folders for test user {}", TEST_USER_ID);
            return folderRepository.findByUserId(TEST_USER_ID);
        } catch (Exception e) {
            logger.error("Error in getCurrentUserFolders", e);
            throw e;
        }
    }
    
    public Folder createFolder(String name) {
        try {
            // AJUTINE: Lihtsustatud loogika testimiseks
            logger.info("Creating folder with name {} for test user {}", name, TEST_USER_ID);
            
            // Otsime testuser'i
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
            
            Folder folder = new Folder();
            folder.setName(name);
            folder.setUser(user);
            
            folder = folderRepository.save(folder);
            logger.info("Created folder with ID: {}", folder.getId());
            
            return folder;
        } catch (Exception e) {
            logger.error("Error in createFolder", e);
            throw e;
        }
    }
} 