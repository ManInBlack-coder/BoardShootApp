package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.FolderRepository;
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

@Service
public class FolderService {
    
    private static final Logger logger = LoggerFactory.getLogger(FolderService.class);
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Testimisloogika - kasutame fikseeritud kasutaja ID-d ainult kui autentimine puudub
    private static final Long TEST_USER_ID = 1L;
    
    public List<Folder> getCurrentUserFolders() {
        try {
            Long userId = getCurrentUserId();
            logger.info("Fetching folders for user {}", userId);
            return folderRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error in getCurrentUserFolders", e);
            throw e;
        }
    }
    
    /**
     * Tagastab kaustad konkreetse kasutaja ID järgi - testimiseks
     */
    public List<Folder> getUserFolders(Long userId) {
        try {
            logger.info("Fetching folders for user ID {}", userId);
            return folderRepository.findByUserId(userId);
        } catch (Exception e) {
            logger.error("Error in getUserFolders", e);
            throw e;
        }
    }
    
    public Folder createFolder(String name) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Creating folder with name {} for user {}", name, userId);
            
            return createFolderWithUserId(name, userId);
        } catch (Exception e) {
            logger.error("Error in createFolder", e);
            throw e;
        }
    }
    
    /**
     * Loob kausta konkreetsele kasutajale ID järgi - testimiseks
     */
    public Folder createFolderWithUserId(String name, Long userId) {
        try {
            logger.info("Creating folder with name {} for specific user ID {}", name, userId);
            
            // Otsime kasutajat
            Optional<User> userOpt = userRepository.findById(userId);
            
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
                logger.info("Found existing user: {} with ID {}", user.getUsername(), user.getId());
            } else {
                // Kui kasutajat pole, siis viskame erindi
                logger.error("User not found with ID: {}", userId);
                throw new RuntimeException("User not found");
            }
            
            Folder folder = new Folder();
            folder.setName(name);
            folder.setUser(user);
            
            folder = folderRepository.save(folder);
            logger.info("Created folder with ID: {} for user ID: {}", folder.getId(), userId);
            
            return folder;
        } catch (Exception e) {
            logger.error("Error in createFolderWithUserId", e);
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
} 